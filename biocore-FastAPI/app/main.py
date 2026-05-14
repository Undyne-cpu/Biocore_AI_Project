from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, users, projects, data, tools, workflows, executions, results, team, visualization, statistics

app = FastAPI(
    title="BioCore API",
    description="BioCore 生物信息分析平台后端API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(data.router)
app.include_router(tools.router)
app.include_router(workflows.router)
app.include_router(executions.router)
app.include_router(results.router)
app.include_router(results.reports_router)
app.include_router(team.router)
app.include_router(visualization.router)
app.include_router(statistics.router)


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message": "BioCore API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}