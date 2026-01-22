import express,{Request,Response, Router} from 'express';
import { getAlumni, uploadAlumni } from '../controllers/alumniController';

const alumniRouter=Router();

alumniRouter.post("/Addalumni",uploadAlumni);

alumniRouter.get("/alumni",getAlumni);

export default alumniRouter;