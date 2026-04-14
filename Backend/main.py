from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import base64
import io
import os
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/demo-images", StaticFiles(directory="demo_images"), name="demo-images")

CLASSES = ["glioma", "meningioma", "notumor", "pituitary"]
CLASS_INFO = {
    "glioma": {"description": "A tumor that grows in the brain and spinal cord.", "severity": "High", "color": "#ff4444"},
    "meningioma": {"description": "A tumor that forms in the membranes surrounding the brain.", "severity": "Moderate", "color": "#ff9900"},
    "notumor": {"description": "No tumor detected. Brain appears healthy.", "severity": "None", "color": "#00cc44"},
    "pituitary": {"description": "A tumor in the pituitary gland at the base of the brain.", "severity": "Moderate", "color": "#ff9900"},
}

device = torch.device("cpu")
model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 4)
model.load_state_dict(torch.load("efficientnet_finetuned.pth", map_location=device))
model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def predict_image(img: Image.Image):
    img_rgb = img.convert("RGB")
    img_resized = img_rgb.resize((224, 224))
    img_array = np.array(img_resized) / 255.0
    input_tensor = transform(img_rgb).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.softmax(outputs, dim=1)[0]

    target_layers = [model.features[-1]]
    with GradCAM(model=model, target_layers=target_layers) as cam:
        pred_class = probs.argmax().item()
        targets = [ClassifierOutputTarget(pred_class)]
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)[0]

    visualization = show_cam_on_image(img_array.astype(np.float32), grayscale_cam, use_rgb=True)

    heatmap_img = Image.fromarray(visualization)
    buffer = io.BytesIO()
    heatmap_img.save(buffer, format="PNG")
    heatmap_b64 = base64.b64encode(buffer.getvalue()).decode()

    orig_buffer = io.BytesIO()
    img_resized.save(orig_buffer, format="PNG")
    orig_b64 = base64.b64encode(orig_buffer.getvalue()).decode()

    return {
        "predicted_class": CLASSES[pred_class],
        "confidence": round(probs[pred_class].item() * 100, 2),
        "probabilities": {CLASSES[i]: round(probs[i].item() * 100, 2) for i in range(4)},
        "class_info": CLASS_INFO[CLASSES[pred_class]],
        "heatmap": heatmap_b64,
        "original": orig_b64,
    }

@app.get("/")
def root():
    return {"status": "Brain Tumor Classifier API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    result = predict_image(img)
    return JSONResponse(content=result)

@app.get("/demo-images-list")
def get_demo_images():
    demo_path = "demo_images"
    images = []
    for fname in os.listdir(demo_path):
        if fname.endswith(".jpg") or fname.endswith(".png"):
            label = fname.split("_")[0]
            images.append({"filename": fname, "label": label})
    return {"images": images}

@app.get("/demo-predict/{filename}")
def demo_predict(filename: str):
    img_path = os.path.join("demo_images", filename)
    img = Image.open(img_path)
    result = predict_image(img)
    return JSONResponse(content=result)