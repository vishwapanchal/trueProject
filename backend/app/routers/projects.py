from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, schemas, models, security

router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)

@router.post("/check-originality", response_model=schemas.OriginalityCheckResponse)
def check_project_originality(request: schemas.OriginalityCheckRequest, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    combined_text = f"{request.title} {request.synopsis or ''}"
    new_embedding = security.get_embedding(combined_text)
    
    if new_embedding is None:
        raise HTTPException(status_code=400, detail="Cannot check originality without embedding generation.")

    SIMILARITY_THRESHOLD = 0.8
    similar_projects_db = db.query(models.ProjectDB, models.ProjectDB.embedding.l2_distance(new_embedding).label('distance')).filter(models.ProjectDB.embedding != None, models.ProjectDB.status == 'approved').order_by('distance').limit(3).all()

    similar_projects_response = []
    is_original = True
    message = "This project idea seems original!"

    if similar_projects_db:
        for project, distance in similar_projects_db:
            similarity_score = 1 - (distance / 2)
            similar_projects_response.append(schemas.SimilarProject(id=project.id, title=project.title, similarity_score=similarity_score))
        
        if similar_projects_response and similar_projects_response[0].similarity_score > SIMILARITY_THRESHOLD:
            is_original = False
            message = "This project is conceptually very similar to existing projects."

    return schemas.OriginalityCheckResponse(is_original=is_original, message=message, similar_projects=similar_projects_response)

@router.get("/", response_model=List[schemas.Project])
def read_all_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.status == 'approved').all()

@router.get("/my-projects", response_model=List[schemas.Project])
def read_my_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.owner_id == current_user.id).all()

@router.get("/mentored", response_model=List[schemas.Project])
def read_mentored_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    return [p for p in current_user.mentored_projects if p.status == 'approved']

@router.get("/pending", response_model=List[schemas.Project])
def read_pending_projects(db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    return db.query(models.ProjectDB).filter(models.ProjectDB.status == 'pending').all()

@router.put("/{project_id}/approve", response_model=schemas.Project)
def approve_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.status = 'approved'
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}/reject", response_model=schemas.Project)
def reject_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_teacher)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.status = 'rejected'
    db.commit()
    db.refresh(db_project)
    return db_project

@router.post("/", response_model=schemas.Project, status_code=201)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    if current_user.role == 'student' and not project.mentor_email:
        raise HTTPException(status_code=422, detail="Mentor's email is required.")

    mentor = None
    if project.mentor_email:
        mentor = db.query(models.UserDB).filter(models.UserDB.email == project.mentor_email).first()
        if not mentor or mentor.role != 'teacher':
            raise HTTPException(status_code=404, detail=f"Mentor with email '{project.mentor_email}' not found.")

    embedding = security.get_embedding(f"{project.title} {project.synopsis or ''}")
    
    db_project = models.ProjectDB(
        title=project.title, 
        synopsis=project.synopsis, 
        owner_id=current_user.id,
        embedding=embedding,
        status='approved' if current_user.role == 'teacher' else 'pending'
    )
    
    if mentor:
        db_project.mentors.append(mentor)
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    is_owner = db_project.owner_id == current_user.id
    is_teacher = current_user.role == 'teacher'

    if not (is_teacher or (is_owner and db_project.status == 'pending')):
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    update_data = project.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
    
    if 'title' in update_data or 'synopsis' in update_data:
        db_project.embedding = security.get_embedding(f"{db_project.title} {db_project.synopsis or ''}")
        
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(database.get_db), current_user: models.UserDB = Depends(security.get_current_user)):
    db_project = db.query(models.ProjectDB).filter(models.ProjectDB.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    is_owner = db_project.owner_id == current_user.id
    is_teacher = current_user.role == 'teacher'

    if not (is_teacher or (is_owner and db_project.status == 'pending')):
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        
    db.delete(db_project)
    db.commit()
    return
