# Optional offline inspection utility; not a live identity-verification API.
# Install kagglehub first. Authentication may be requested by Kaggle.
from pathlib import Path
import kagglehub

path = Path(kagglehub.dataset_download('unidpro/synthetic-passports-dataset'))
print('Downloaded dataset:', path)
images = [p for p in path.rglob('*') if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}]
print('Image count:', len(images))
for image in images:
    print(image.relative_to(path), image.stat().st_size, 'bytes')
print('Check the source license and annotations before reuse. Synthetic samples are not validity records.')
