"""Train and evaluate the model on SYNTHETIC data: python train.py"""
from ruralshield.model import evaluate, save, train

if __name__ == "__main__":
    models, holdout = train()
    for target, r in evaluate(models, holdout).items():
        print(f"== {target} (synthetic hold-out, NOT real-world accuracy) ==")
        print(r["report"])
    save(models)
    print("Saved model.")
