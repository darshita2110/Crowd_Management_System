"""Helper utilities for robust local/CI inference for lightweightcrowdcounting notebook.

Usage (from a notebook cell):
    from inference_utils import (
        check_environment, set_seeds, find_image_paths, load_model,
        safe_inference_loop, unit_test_inference
    )

See README_NOTE.md for a short notebook cell you can paste to install deps and run a smoke test.
"""
from __future__ import annotations
import os
import sys
import json
import csv
import math
import random
from pathlib import Path
from typing import List, Tuple, Optional, Any, Dict

def _safe_import(name: str):
    try:
        module = __import__(name)
        return module
    except Exception:
        return None

torch = _safe_import('torch')
np = _safe_import('numpy')
Image = _safe_import('PIL.Image')
cv2 = _safe_import('cv2')
plt = _safe_import('matplotlib.pyplot')
transforms = None
if torch:
    try:
        from torchvision import transforms as _t
        transforms = _t
    except Exception:
        transforms = None

def check_environment():
    """Check/install hints and return device string and a short summary.

    This function does not perform installs; it prints concise pip commands if
    required packages are missing so the caller (notebook) can run them.
    """
    missing = []
    for name in ('torch', 'torchvision', 'opencv-python', 'Pillow', 'tqdm', 'matplotlib'):
        # check by import name mapping for opencv-python
        if name == 'opencv-python':
            if cv2 is None:
                missing.append(name)
        else:
            if _safe_import(name.split('-')[0]) is None:
                missing.append(name)

    # Device selection
    device = 'cpu'
    if torch:
        try:
            if torch.cuda.is_available():
                device = 'cuda'
            else:
                device = 'cpu'
        except Exception:
            device = 'cpu'

    print(f"Device: {device}")
    if missing:
        print("Missing packages detected:", ", ".join(missing))
        print("To install, run in a notebook cell or shell:")
        print("pip install " + " ".join(missing))
    else:
        print("All core packages appear available.")

    return device

def set_seeds(seed: int = 42):
    """Set seeds for python, numpy and torch for reproducibility."""
    random.seed(seed)
    if np:
        try:
            np.random.seed(seed)
        except Exception:
            pass
    if torch:
        try:
            torch.manual_seed(seed)
            if torch.cuda.is_available():
                torch.cuda.manual_seed_all(seed)
                # Deterministic settings (may slow down)
                try:
                    torch.backends.cudnn.deterministic = True
                    torch.backends.cudnn.benchmark = False
                except Exception:
                    pass
        except Exception:
            pass

def find_image_paths(repo_sample_dir: str = './data/sample_images') -> Tuple[List[str], str]:
    """Return a list of image file paths and the source directory used.

    Preference order:
      1. DRIVE_PATH environment variable (if set and contains images)
      2. Common Google Drive mount points
      3. Repo sample images folder
    """
    candidates = []
    env_drive = os.environ.get('DRIVE_PATH')
    if env_drive:
        candidates.append(env_drive)

    # common mount points
    candidates.extend([
        '/content/drive/MyDrive',
        '/mnt/drive',
        '/mnt/disks/drive',
        str(Path.home() / 'Google Drive'),
    ])

    # Ensure repo sample dir is last resort
    # Also consider top-level 'samplecrowd' (present in this repo) as a common sample folder
    try:
        repo_root_sample = str(Path(__file__).resolve().parents[1] / 'samplecrowd')
        candidates.append(repo_root_sample)
    except Exception:
        candidates.append('./samplecrowd')
    candidates.append(repo_sample_dir)

    image_exts = ('.jpg', '.jpeg', '.png', '.bmp', '.tif', '.tiff')
    found = []
    used_source = ''
    for cand in candidates:
        if not cand:
            continue
        if not os.path.exists(cand):
            continue
        # walk and collect images
        for root, _, files in os.walk(cand):
            for f in files:
                if f.lower().endswith(image_exts):
                    found.append(os.path.join(root, f))
        if found:
            used_source = cand
            break

    if not found:
        raise FileNotFoundError(
            f"No images found in Drive mounts or '{repo_sample_dir}'.\n" \
            f"Please place sample images under '{repo_sample_dir}' or set DRIVE_PATH to a folder containing images."
        )

    # sort for reproducibility
    found.sort()
    return found, used_source

def load_model(model_path: str, device: Optional[str] = None) -> Optional[Any]:
    """Attempt to load a model via torch.jit.load or torch.load.

    Returns loaded model or None if not available.
    """
    if torch is None:
        print("torch not available; skipping model load.")
        return None

    if device is None:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'

    if not model_path or not os.path.isfile(model_path):
        print(f"Model weights not found at '{model_path}'. Skipping heavy inference.")
        return None

    model = None
    try:
        # Try loading TorchScript first (fast, portable)
        model = torch.jit.load(model_path, map_location=device)
        print(f"Loaded TorchScript model from {model_path}")
    except Exception:
        try:
            # Fall back to state_dict or normal model file
            model = torch.load(model_path, map_location=device)
            print(f"Loaded model via torch.load from {model_path}")
            # If a state_dict was returned, the notebook author must provide model architecture.
            if isinstance(model, dict) and 'state_dict' in model:
                print("Note: loaded dict contains 'state_dict'. You must construct the architecture and load state_dict manually.")
                return None
        except Exception as e:
            print(f"Failed to load model: {e}")
            return None

    try:
        model.eval()
        if hasattr(model, 'to'):
            model.to(device)
    except Exception:
        pass
    return model

def _preprocess_pil(img, target_size=(512, 512)):
    """Preprocess PIL image to tensor matching common models."""
    if transforms is None:
        # minimal numpy fallback
        if np is None:
            raise RuntimeError('Neither torchvision.transforms nor numpy available for preprocessing')
        arr = np.array(img.resize(target_size))
        # convert to CHW normalized 0-1
        arr = arr.astype('float32') / 255.0
        arr = np.transpose(arr, (2,0,1))
        return torch.from_numpy(arr)

    t = transforms.Compose([
        transforms.Resize(target_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    return t(img)

def preprocess_image(image_path: str, target_size=(512,512)):
    """Load image and return a tensor (C,H,W) on CPU. Caller moves to device/batch.
    """
    if Image is None:
        raise RuntimeError('Pillow is required to read images')
    pil = Image.open(image_path).convert('RGB')
    tensor = _preprocess_pil(pil, target_size=target_size)
    return tensor

def infer_image(model: Any, tensor: Any, device: str = 'cpu') -> Tuple[float, Optional[Any]]:
    """Run model on a single tensor (C,H,W) or (1,C,H,W). Returns (count, raw_output).
    """
    if model is None:
        raise RuntimeError('Model is not loaded')
    if torch is None:
        raise RuntimeError('torch is required for inference')

    model_device = device
    t = tensor.unsqueeze(0).to(model_device)
    with torch.no_grad():
        out = model(t)
    # Convert output to numeric count: sum if map-like, else flatten
    try:
        if isinstance(out, (list, tuple)):
            out0 = out[0]
        else:
            out0 = out
        if hasattr(out0, 'detach'):
            arr = out0.detach().cpu().numpy()
        else:
            arr = np.array(out0)
        if arr.ndim >= 2:
            count = float(arr.sum())
        else:
            count = float(arr.mean())
    except Exception:
        # Fallback: try float conversion
        try:
            count = float(out)
        except Exception:
            count = 0.0
    return count, out

def visualize_and_save(image_path: str, output_any: Any, count: float, outputs_dir: str = './outputs'):
    """Save overlay/heatmap and write CSV/JSON entries for the prediction.
    """
    os.makedirs(outputs_dir, exist_ok=True)
    base = os.path.splitext(os.path.basename(image_path))[0]
    img_out_path = os.path.join(outputs_dir, f"{base}_pred.png")
    json_out_path = os.path.join(outputs_dir, f"{base}_pred.json")
    csv_out_path = os.path.join(outputs_dir, "predictions.csv")

    # Load original image
    if Image is None:
        return
    pil = Image.open(image_path).convert('RGB')
    # Make a simple matplotlib figure with image and title
    if plt:
        fig = plt.figure(figsize=(8,6))
        ax = fig.add_subplot(1,1,1)
        ax.imshow(pil)
        ax.set_title(f"Predicted: {int(round(count))} people")
        ax.axis('off')
        try:
            fig.savefig(img_out_path, bbox_inches='tight')
        except Exception:
            pil.save(img_out_path)
        try:
            plt.close(fig)
        except Exception:
            pass
    else:
        # Pillow fallback — just save original
        pil.save(img_out_path)

    # Save json
    with open(json_out_path, 'w', encoding='utf-8') as jf:
        json.dump({'image': image_path, 'count': int(round(count))}, jf, indent=2)

    # Append to CSV
    write_header = not os.path.exists(csv_out_path)
    with open(csv_out_path, 'a', newline='', encoding='utf-8') as cf:
        writer = csv.writer(cf)
        if write_header:
            writer.writerow(['image', 'prediction_count', 'json_path'])
        writer.writerow([image_path, int(round(count)), json_out_path])

def safe_inference_loop(
    model: Any,
    image_paths: List[str],
    device: Optional[str] = None,
    target_size: Tuple[int,int] = (512,512),
    outputs_dir: str = './outputs',
    max_images: Optional[int] = None
):
    """Run inference on list of images safely and save outputs; returns summary list.
    """
    if device is None and torch:
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
    elif device is None:
        device = 'cpu'

    results = []
    from tqdm import tqdm as _tqdm
    iterator = image_paths[:max_images] if max_images else image_paths
    for p in _tqdm(iterator, desc='Inferring'):
        try:
            tensor = preprocess_image(p, target_size=target_size)
            count, raw = infer_image(model, tensor, device=device)
            visualize_and_save(p, raw, count, outputs_dir=outputs_dir)
            results.append({'image': p, 'count': int(round(count))})
        except Exception as e:
            print(f"[!] Error on {os.path.basename(p)}: {e}")
            results.append({'image': p, 'count': None, 'error': str(e)})
    return results

def unit_test_inference(model: Any, repo_sample_dir: str = './data/sample_images') -> Dict[str, Any]:
    """Quick smoke test: run inference on first 2 sample images and report counts.

    If model is None, returns explanation message (non-fatal).
    """
    try:
        paths, src = find_image_paths(repo_sample_dir)
    except Exception as e:
        return {'ok': False, 'reason': str(e)}

    test_imgs = paths[:2]
    if not test_imgs:
        return {'ok': False, 'reason': 'No sample images found.'}

    if model is None:
        return {'ok': False, 'reason': 'Model not loaded; cannot run inference.'}

    res = safe_inference_loop(model, test_imgs, max_images=2)
    return {'ok': True, 'results': res}
