from fastapi import APIRouter, Request, HTTPException, status, UploadFile, File
from typing import Optional
import os
import tempfile
from pathlib import Path

router = APIRouter(prefix="/inference", tags=["Inference"])


@router.post('/count')
async def infer_count(request: Request, file: UploadFile = File(None)):
    """Accept an image file upload and return the estimated people count.

    - Attempts to use `inference_utils.load_model` and associated helpers if available.
    - Falls back to `lwcc` if installed.
    - If `save_record` is true, the endpoint will attempt to persist a
      crowd-density record into the existing `crowd_density` collection
      (if available in the application scope).
    """
    # If FastAPI provided an UploadFile (standard multipart handling), prefer it — this works with Postman
    if file is not None:
        upload = file
        save_record = False
        radius_m = None
        event_id = None
        area_name = None
        # try to parse optional form fields from request.form() if present
        try:
            form = await request.form()
            def _parse_bool(v):
                if v is None:
                    return False
                if isinstance(v, bool):
                    return v
                s = str(v).lower()
                return s in ('1','true','yes','y')
            save_record = _parse_bool(form.get('save_record'))
            radius_raw = form.get('radius_m')
            try:
                radius_m = float(radius_raw) if radius_raw not in (None, '') else None
            except Exception:
                radius_m = None
            event_id = form.get('event_id')
            area_name = form.get('area_name')
        except Exception:
            # form may not be present or python-multipart missing; continue with defaults
            pass

        suffix = Path(getattr(upload, 'filename', 'upload.jpg')).suffix or '.jpg'
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        try:
            contents = await upload.read()
            tmp.write(contents)
            tmp.flush()
            tmp_path = tmp.name
        finally:
            try:
                tmp.close()
            except Exception:
                pass
    else:
        # Fallback: parse form data (older behavior). This requires python-multipart installed at runtime.
        try:
            form = await request.form()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Unable to parse form data: {e}\nInstall python-multipart if using multipart form uploads.")

        upload = form.get('file')
        if upload is None:
            raise HTTPException(status_code=400, detail='Missing form field "file"')

        def _parse_bool(v):
            if v is None:
                return False
            if isinstance(v, bool):
                return v
            s = str(v).lower()
            return s in ('1','true','yes','y')

        save_record = _parse_bool(form.get('save_record'))
        radius_raw = form.get('radius_m')
        try:
            radius_m = float(radius_raw) if radius_raw not in (None, '') else None
        except Exception:
            radius_m = None
        event_id = form.get('event_id')
        area_name = form.get('area_name')

        # Write upload to a temporary file
        suffix = Path(getattr(upload, 'filename', 'upload.jpg')).suffix or '.jpg'
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        try:
            contents = await upload.read()
            tmp.write(contents)
            tmp.flush()
            tmp_path = tmp.name
        finally:
            try:
                tmp.close()
            except Exception:
                pass

    count = None
    backend_error = None
    # Try to use inference_utils (preferred)
    try:
        from .. import inference_utils as iu  # relative import
    except Exception:
        iu = None

    # Try torch-based model if available via inference_utils
    try:
        if iu is not None:
            model_path = os.getenv('MODEL_PATH', './model_weights.pt')
            device = 'cuda' if getattr(iu, 'torch', None) and iu.torch.cuda.is_available() else 'cpu'
            model = iu.load_model(str(model_path), device=device)
            if model is not None:
                tensor = iu.preprocess_image(tmp_path, target_size=(512,512))
                c, _ = iu.infer_image(model, tensor, device=device)
                count = int(round(float(c)))
    except Exception as e:
        backend_error = str(e)

    # Fallback to LWCC if still None. LWCC has a known issue where it tries to write
    # to a hardcoded '/.lwcc' path regardless of HOME settings. We'll monkey-patch
    # the pathlib.Path to redirect /.lwcc to a temporary directory.
    if count is None:
        try:
            with tempfile.TemporaryDirectory(prefix='lwcc_home_') as _lwcc_home:
                old_home = os.environ.get('HOME')
                lwcc_home = os.environ.get('LWCC_HOME', _lwcc_home)
                
                # Ensure the directory exists
                try:
                    os.makedirs(lwcc_home, exist_ok=True)
                except Exception:
                    lwcc_home = _lwcc_home
                
                # Set environment variables
                os.environ['HOME'] = lwcc_home
                os.environ['XDG_CACHE_HOME'] = os.path.join(lwcc_home, '.cache')
                os.environ['XDG_CONFIG_HOME'] = os.path.join(lwcc_home, '.config')
                
                # Create .lwcc directory in temp location
                lwcc_dir = os.path.join(lwcc_home, '.lwcc')
                os.makedirs(lwcc_dir, exist_ok=True)
                # Also create common subdirectories that LWCC might need
                os.makedirs(os.path.join(lwcc_dir, 'weights'), exist_ok=True)
                os.makedirs(os.path.join(lwcc_dir, 'cache'), exist_ok=True)
                
                print(f"[DEBUG] Temp LWCC dir: {lwcc_dir}")
                
                # Also monkey-patch os.path operations and os.makedirs for /.lwcc
                import os as os_module
                import builtins
                original_builtins_open = builtins.open
                original_os_makedirs = os_module.makedirs
                original_os_path_exists = os_module.path.exists
                original_os_path_isdir = os_module.path.isdir
                original_os_path_isfile = os_module.path.isfile
                original_os_listdir = os_module.listdir
                original_os_rename = os_module.rename
                original_os_replace = os_module.replace
                original_os_remove = os_module.remove
                original_os_unlink = os_module.unlink
                
                def redirect_os_path(path):
                    """Redirect /.lwcc paths to temp directory"""
                    if isinstance(path, str) and (path == '/.lwcc' or path.startswith('/.lwcc/')):
                        return path.replace('/.lwcc', lwcc_dir)
                    return path
                
                def patched_builtins_open(file, mode='r', *args, **kwargs):
                    """Patch built-in open() to redirect /.lwcc paths"""
                    # Handle both string paths and file-like objects
                    if isinstance(file, str):
                        redirected_file = redirect_os_path(file)
                    else:
                        redirected_file = file
                    return original_builtins_open(redirected_file, mode, *args, **kwargs)
                
                def patched_os_makedirs(name, mode=0o777, exist_ok=False):
                    return original_os_makedirs(redirect_os_path(name), mode, exist_ok)
                
                def patched_os_path_exists(path):
                    return original_os_path_exists(redirect_os_path(path))
                
                def patched_os_path_isdir(path):
                    return original_os_path_isdir(redirect_os_path(path))
                
                def patched_os_path_isfile(path):
                    return original_os_path_isfile(redirect_os_path(path))
                
                def patched_os_listdir(path):
                    return original_os_listdir(redirect_os_path(path))
                
                def patched_os_rename(src, dst, *args, **kwargs):
                    return original_os_rename(redirect_os_path(src), redirect_os_path(dst), *args, **kwargs)
                
                def patched_os_replace(src, dst, *args, **kwargs):
                    return original_os_replace(redirect_os_path(src), redirect_os_path(dst), *args, **kwargs)
                
                def patched_os_remove(path, *args, **kwargs):
                    return original_os_remove(redirect_os_path(path), *args, **kwargs)
                
                def patched_os_unlink(path, *args, **kwargs):
                    return original_os_unlink(redirect_os_path(path), *args, **kwargs)
                
                # Apply built-in open patch
                builtins.open = patched_builtins_open
                
                # Apply os module patches
                os_module.makedirs = patched_os_makedirs
                os_module.path.exists = patched_os_path_exists
                os_module.path.isdir = patched_os_path_isdir
                os_module.path.isfile = patched_os_path_isfile
                os_module.listdir = patched_os_listdir
                os_module.rename = patched_os_rename
                os_module.replace = patched_os_replace
                os_module.remove = patched_os_remove
                os_module.unlink = patched_os_unlink
                
                # Monkey-patch Path methods to redirect /.lwcc to temp dir
                import pathlib
                original_path_mkdir = pathlib.Path.mkdir
                original_path_open = pathlib.Path.open
                original_path_exists = pathlib.Path.exists
                original_path_iterdir = pathlib.Path.iterdir
                original_path_is_dir = pathlib.Path.is_dir
                original_path_is_file = pathlib.Path.is_file
                original_path_str = pathlib.Path.__str__
                original_path_truediv = pathlib.Path.__truediv__
                
                def redirect_path(path_str):
                    """Redirect /.lwcc paths to our temp directory"""
                    if path_str == '/.lwcc' or path_str.startswith('/.lwcc/'):
                        return path_str.replace('/.lwcc', lwcc_dir)
                    return path_str
                
                def patched_path_mkdir(self, mode=0o777, parents=False, exist_ok=False):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    return original_path_mkdir(redirected, mode, parents, exist_ok)
                
                def patched_path_open(self, *args, **kwargs):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    # Call the original open on the redirected path
                    return original_path_open.__get__(redirected, type(redirected))(*args, **kwargs)
                
                def patched_path_exists(self):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    return original_path_exists(redirected)
                
                def patched_path_iterdir(self):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    return original_path_iterdir(redirected)
                
                def patched_path_is_dir(self):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    return original_path_is_dir(redirected)
                
                def patched_path_is_file(self):
                    redirected = pathlib.Path(redirect_path(str(self)))
                    return original_path_is_file(redirected)
                
                def patched_path_truediv(self, key):
                    # Handle path / "subdir" operations
                    result = original_path_truediv(self, key)
                    result_str = str(result)
                    if result_str.startswith('/.lwcc'):
                        return pathlib.Path(redirect_path(result_str))
                    return result
                
                # Apply patches
                pathlib.Path.mkdir = patched_path_mkdir
                pathlib.Path.open = patched_path_open
                pathlib.Path.exists = patched_path_exists
                pathlib.Path.iterdir = patched_path_iterdir
                pathlib.Path.is_dir = patched_path_is_dir
                pathlib.Path.is_file = patched_path_is_file
                pathlib.Path.__truediv__ = patched_path_truediv
                
                try:
                    print("[DEBUG] Importing LWCC with path redirection...")
                    from lwcc import LWCC
                    print(f"[DEBUG] Calling LWCC.get_count...")
                    c = LWCC.get_count([tmp_path], model_name='DM-Count', model_weights='SHA', resize_img=True)
                    count = int(round(float(c)))
                    print(f"[DEBUG] LWCC SUCCESS! Count: {count}")
                except Exception as e:
                    print(f"[DEBUG] LWCC error: {type(e).__name__}: {e}")
                    if backend_error is None:
                        backend_error = str(e)
                finally:
                    # Restore original methods
                    pathlib.Path.mkdir = original_path_mkdir
                    pathlib.Path.open = original_path_open
                    pathlib.Path.exists = original_path_exists
                    pathlib.Path.iterdir = original_path_iterdir
                    pathlib.Path.is_dir = original_path_is_dir
                    pathlib.Path.is_file = original_path_is_file
                    pathlib.Path.__truediv__ = original_path_truediv
                    
                    # Restore built-in open
                    builtins.open = original_builtins_open
                    
                    # Restore os module methods
                    os_module.makedirs = original_os_makedirs
                    os_module.path.exists = original_os_path_exists
                    os_module.path.isdir = original_os_path_isdir
                    os_module.path.isfile = original_os_path_isfile
                    os_module.listdir = original_os_listdir
                    os_module.rename = original_os_rename
                    os_module.replace = original_os_replace
                    os_module.remove = original_os_remove
                    os_module.unlink = original_os_unlink
                    
                    # Restore original HOME
                    if old_home is None:
                        os.environ.pop('HOME', None)
                    else:
                        os.environ['HOME'] = old_home
        except Exception as outer_e:
            print(f"[DEBUG] Outer exception: {type(outer_e).__name__}: {outer_e}")
            if backend_error is None:
                backend_error = str(outer_e)

    # Clean up temporary file
    try:
        os.unlink(tmp_path)
    except Exception:
        pass

    if count is None:
        raise HTTPException(status_code=500, detail={
            'message': 'Could not run inference; no backend available',
            'error': backend_error,
        })

    response = {
        'image_filename': getattr(upload, 'filename', 'uploaded'),
        'person_count': int(count),
    }

    # Optionally compute density if radius provided
    if radius_m:
        try:
            area = 3.141592653589793 * (radius_m ** 2)
            ppl_per_m2 = round(count / area, 3) if area > 0 else 0.0
            response['area_m2'] = round(area, 3)
            response['people_per_m2'] = ppl_per_m2
        except Exception:
            pass

    # Optionally save into crowd_density collection if available
    if save_record:
        try:
            # import here to avoid circular imports at module load
            from ..routes.crowd_density import generate_density_id, calculate_density, crowd_density_collection
            from datetime import datetime
            record = {
                'id': generate_density_id(),
                'timestamp': datetime.utcnow(),
                'person_count': int(count),
                'radius_m': float(radius_m) if radius_m else 0.0,
                'event_id': event_id,
                'area_name': area_name,
                'location': None,
            }
            # calculate derived metrics
            record = calculate_density(record)
            # insert (best effort)
            await crowd_density_collection.insert_one(record)
            response['saved'] = True
            response['record_id'] = record['id']
        except Exception as e:
            # don't fail the request if DB save fails; include warning
            response['saved'] = False
            response['save_error'] = str(e)

    return response
