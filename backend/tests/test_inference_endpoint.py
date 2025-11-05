import sys
import types
from pathlib import Path

from fastapi.testclient import TestClient


def test_inference_endpoint_with_fake_lwcc(tmp_path):
    """Smoke test for /inference/count using a fake LWCC module to avoid heavy deps.

    The test injects a dummy `lwcc` module into sys.modules with a LWCC class
    exposing `get_count` that returns a deterministic value.
    """
    # create fake lwcc module
    fake_mod = types.SimpleNamespace()

    class LWCC:
        @staticmethod
        def get_count(paths, **kwargs):
            # return a deterministic fake count
            return 7

    fake_mod.LWCC = LWCC
    sys.modules['lwcc'] = fake_mod

    # locate a sample image from repo samplecrowd
    repo_root = Path(__file__).resolve().parents[2]
    sample_dir = repo_root / 'samplecrowd'
    imgs = list(sample_dir.glob('*'))
    assert imgs, f'No sample images found in {sample_dir}'
    img_path = imgs[0]

    # import app under test
    from main import app

    client = TestClient(app)

    with open(img_path, 'rb') as fh:
        files = {'file': (img_path.name, fh, 'image/jpeg')}
        resp = client.post('/inference/count', files=files)

    assert resp.status_code == 200, f'Unexpected status {resp.status_code}: {resp.text}'
    data = resp.json()
    assert 'person_count' in data
    assert isinstance(data['person_count'], int)
    assert data['person_count'] == 7
