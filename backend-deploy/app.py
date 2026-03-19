from main import app
from mangum import Mangum

# Wrap FastAPI app with Mangum for serverless
handler = Mangum(app, lifespan="off")
