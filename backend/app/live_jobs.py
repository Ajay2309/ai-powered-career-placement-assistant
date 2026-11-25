
from fastapi import APIRouter, HTTPException, Query
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import URLError
import json

router = APIRouter(prefix="/live-jobs", tags=["Live Job Search"])

REMOTIVE_API = "https://remotive.com/api/remote-jobs"


@router.get("/search")
def search_live_jobs(
    keyword: str = Query(default="", max_length=100),
    limit: int = Query(default=30, ge=1, le=50),
):
    params = {
        "search": keyword,
        "limit": limit,
    }

    url = f"{REMOTIVE_API}?{urlencode(params)}"

    request = Request(
        url,
        headers={
            "User-Agent": "CareerPlacementAssistant/1.0"
        },
    )

    try:
        with urlopen(request, timeout=20) as response:
            data = json.loads(response.read().decode("utf-8"))

    except URLError:
        raise HTTPException(
            status_code=503,
            detail="Job service is temporarily unavailable. Please try again.",
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve jobs from the external job source.",
        )

    jobs = []

    for job in data.get("jobs", []):
        jobs.append({
            "id": job.get("id"),
            "title": job.get("title", "Untitled Job"),
            "company": job.get("company_name", "Unknown Company"),
            "company_logo": job.get("company_logo"),
            "location": job.get("candidate_required_location", "Worldwide"),
            "category": job.get("category", ""),
            "job_type": job.get("job_type", ""),
            "salary": job.get("salary", "Not disclosed"),
            "description": job.get("description", ""),
            "url": job.get("url", ""),
            "publication_date": job.get("publication_date", ""),
            "source": "Remotive",
        })

    return {
        "total": len(jobs),
        "keyword": keyword,
        "jobs": jobs,
    }
