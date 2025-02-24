from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from typing import List
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import unquote  # Adicione esta importação no topo do arquivo

# Carrega variáveis de ambiente
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite apenas seu site
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Métodos permitidos
    allow_headers=["Content-Type", "Authorization"],  # Headers específicos
)

# Configuração do banco de dados
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "postgres"),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", "OwU6Y7ko8EHOCC9j"),
    "host": os.getenv("DB_HOST", "foolishly-erudite-stag.data-1.use1.tembo.io"),
    "port": os.getenv("DB_PORT", "5432"),
}
DATABASE_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"

# Conexão com o banco de dados
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Modelos de dados
class ColaboradorModel(Base):
    __tablename__ = 'colaboradores'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)
    equipe = Column(String, index=True)  # Nova coluna


class NotificacaoModel(Base):
    __tablename__ = 'notificacoes'
    notificacao_id = Column(Integer, primary_key=True, index=True)
    colaborador = Column(String, index=True)
    mensagem = Column(String)
    mensagem2 = Column(String)
    observacoes = Column(String)
    ambiente = Column(String)  # Novo campo
    dataHora = Column(DateTime)


class ItemErroModel(Base):
    __tablename__ = 'itens_erro'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)


class ItemAtividadeModel(Base):
    __tablename__ = 'itens_atividades'
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)


class EquipeModel(Base):
    __tablename__ = 'equipes'
    id = Column(Integer, primary_key=True, index=True)
    equipe = Column(String, unique=True, index=True)


class UserModel(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, unique=True, index=True)
    senha = Column(String)
    tipo = Column(String)


Base.metadata.create_all(bind=engine)


# Dependência de sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Modelos Pydantic
class ColaboradorSchema(BaseModel):
    nome: str
    equipe: str | None = None  # Tornando opcional para compatibilidade


class NotificacaoSchema(BaseModel):
    colaborador: str
    mensagem: str
    mensagem2: str
    observacoes: str
    ambiente: str | None = None  # Novo campo
    dataHora: int


class ItemErroSchema(BaseModel):
    nome: str


class ItemAtividadeSchema(BaseModel):
    nome: str


class EquipeSchema(BaseModel):
    equipe: str


# Endpoints

# Sincronizar colaboradores
@app.post("/sync-colaboradores")
async def sync_colaboradores(colaboradores: List[ColaboradorSchema], db: Session = Depends(get_db)):
    try:
        # Limpa a tabela atual
        db.query(ColaboradorModel).delete()

        # Adiciona os novos colaboradores
        for colaborador in colaboradores:
            db_colaborador = ColaboradorModel(
                nome=colaborador.nome,
                equipe=colaborador.equipe
            )
            db.add(db_colaborador)

        db.commit()
        return {"success": True, "message": "Colaboradores sincronizados com sucesso"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar colaboradores: {str(e)}")


# Obter lista de colaboradores
@app.get("/get-colaboradores")
async def get_colaboradores(db: Session = Depends(get_db)):
    try:
        colaboradores = db.query(ColaboradorModel).all()
        return {
            "success": True,
            "colaboradores": [{"nome": c.nome, "equipe": c.equipe} for c in colaboradores]
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar colaboradores: {str(e)}")


# Sincronizar notificações
@app.post("/sync-notificacoes")
async def sync_notificacoes(notificacoes: List[NotificacaoSchema], db: Session = Depends(get_db)):
    try:
        for notificacao in notificacoes:
            db_notificacao = NotificacaoModel(
                colaborador=notificacao.colaborador,
                mensagem=notificacao.mensagem,
                mensagem2=notificacao.mensagem2,  # Novo campo
                observacoes=notificacao.observacoes,
                ambiente=notificacao.ambiente,  # Novo campo
                dataHora=datetime.utcfromtimestamp(notificacao.dataHora / 1000)
            )
            db.merge(db_notificacao)
        db.commit()
        return {"success": True, "message": "Notificações sincronizadas com sucesso!"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar notificações: {str(e)}")


# Obter lista de notificações
@app.get("/get-notificacoes")
async def get_notificacoes(db: Session = Depends(get_db)):
    try:
        notificacoes = db.query(NotificacaoModel).all()
        return {
            "success": True,
            "notificacoes": [
                {
                    "notificacao_id": n.notificacao_id,
                    "colaborador": n.colaborador,
                    "mensagem": n.mensagem,
                    "mensagem2": n.mensagem2,
                    "observacoes": n.observacoes,
                    "ambiente": n.ambiente,
                    "dataHora": n.dataHora.timestamp() * 1000
                } for n in notificacoes
            ]
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar notificações: {str(e)}")


# Sincronizar itens de erro
@app.post("/sync-itens-erro")
async def sync_itens_erro(itens_erro: List[ItemErroSchema], db: Session = Depends(get_db)):
    try:
        for item in itens_erro:
            db_item = ItemErroModel(nome=item.nome)
            db.merge(db_item)
        db.commit()
        return {"success": True, "message": "Itens de erro sincronizados com sucesso!"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar itens de erro: {str(e)}")


# Obter lista de itens de erro
@app.get("/get-itens-erro")
async def get_itens_erro(db: Session = Depends(get_db)):
    try:
        itens_erro = db.query(ItemErroModel).all()
        return {"success": True, "itens_erro": [i.nome for i in itens_erro]}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar itens de erro: {str(e)}")


# Sincronizar itens de atividades
@app.post("/sync-itens-atividades")
async def sync_itens_atividades(itens_atividades: List[ItemAtividadeSchema], db: Session = Depends(get_db)):
    try:
        for item in itens_atividades:
            db_item = ItemAtividadeModel(nome=item.nome)
            db.merge(db_item)
        db.commit()
        return {"success": True, "message": "Itens de atividades sincronizados com sucesso!"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar itens de atividades: {str(e)}")


# Obter lista de itens de atividades
@app.get("/get-itens-atividades")
async def get_itens_atividades(db: Session = Depends(get_db)):
    try:
        itens_atividades = db.query(ItemAtividadeModel).all()
        return {"success": True, "itens_atividades": [i.nome for i in itens_atividades]}
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar itens de atividades: {str(e)}")


# Novo endpoint para obter lista de equipes
@app.get("/get-equipes")
async def get_equipes(db: Session = Depends(get_db)):
    try:
        equipes = db.query(EquipeModel.equipe).all()
        return {
            "success": True,
            "equipes": [equipe[0] for equipe in equipes]  # Extrai apenas o nome da equipe
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar equipes: {str(e)}")


# Novo endpoint para obter colaboradores por equipe
@app.get("/get-colaboradores-por-equipe/{equipe}")
async def get_colaboradores_por_equipe(equipe: str, db: Session = Depends(get_db)):
    try:
        colaboradores = db.query(ColaboradorModel) \
            .filter(ColaboradorModel.equipe == equipe) \
            .all()
        return {
            "success": True,
            "colaboradores": [{"id": c.id, "nome": c.nome, "equipe": c.equipe} for c in colaboradores]
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar colaboradores da equipe: {str(e)}")


# Endpoint de saúde da API
@app.get("/")
def health_check():
    return {"message": "API funcionando!"}


# Modifique o endpoint sync-colaboradores para adicionar-colaborador
@app.post("/adicionar-colaborador")
async def adicionar_colaborador(colaborador: ColaboradorSchema, db: Session = Depends(get_db)):
    try:
        # Verifica se já existe um colaborador com o mesmo nome
        existente = db.query(ColaboradorModel).filter(ColaboradorModel.nome == colaborador.nome).first()
        if existente:
            raise HTTPException(status_code=400, detail="Colaborador já existe")

        # Adiciona apenas o novo colaborador
        db_colaborador = ColaboradorModel(
            nome=colaborador.nome,
            equipe=colaborador.equipe
        )
        db.add(db_colaborador)
        db.commit()
        return {"success": True, "message": "Colaborador adicionado com sucesso"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao adicionar colaborador: {str(e)}")


# Adicione este endpoint para remover um colaborador específico
@app.delete("/remover-colaborador/{nome}")
async def remover_colaborador(nome: str, db: Session = Depends(get_db)):
    try:
        # Decodifica o nome da URL e processa
        nome_decodificado = unquote(nome)
        print(f"Nome recebido: '{nome_decodificado}'")

        # Busca todos os colaboradores para debug
        todos_colaboradores = db.query(ColaboradorModel).all()
        print("Colaboradores no banco:", [c.nome for c in todos_colaboradores])

        # Busca o colaborador com log da query
        nome_processado = nome_decodificado.strip().lower()
        print(f"Buscando colaborador com nome processado: '{nome_processado}'")

        colaborador = db.query(ColaboradorModel) \
            .filter(func.lower(ColaboradorModel.nome) == nome_processado) \
            .first()

        if not colaborador:
            # Log se não encontrou
            raise HTTPException(
                status_code=404,
                detail=f"Colaborador não encontrado. Nome buscado: '{nome_decodificado}'"
            )

        # Log do colaborador encontrado
        print(f"Colaborador encontrado: {colaborador.nome}")

        db.delete(colaborador)
        db.commit()
        return {"success": True, "message": "Colaborador removido com sucesso"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao remover colaborador: {str(e)}")


# Adicione este endpoint para adicionar uma nova equipe
@app.post("/adicionar-equipe")
async def adicionar_equipe(equipe: EquipeSchema, db: Session = Depends(get_db)):
    try:
        # Verifica se a equipe já existe
        existente = db.query(EquipeModel).filter(EquipeModel.equipe == equipe.equipe).first()
        if existente:
            raise HTTPException(status_code=400, detail="Equipe já existe")

        # Adiciona nova equipe
        db_equipe = EquipeModel(equipe=equipe.equipe)
        db.add(db_equipe)
        db.commit()
        return {"success": True, "message": "Equipe adicionada com sucesso"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao adicionar equipe: {str(e)}")


# Adicione este endpoint para verificar login
@app.get("/verificar-login/{usuario}/{senha}")
async def verificar_login(usuario: str, senha: str, db: Session = Depends(get_db)):
    try:
        # Busca o usuário no banco
        user = db.query(UserModel).filter(UserModel.usuario == usuario).first()
        
        if not user or user.senha != senha:
            return {
                "success": False,
                "message": "Usuário ou senha incorretos"
            }
        
        return {
            "success": True,
            "usuario": user.usuario,
            "tipo": user.tipo
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar login: {str(e)}")
