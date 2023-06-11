import {Router} from 'express';
import * as bookController from "./controller/book.controller.js";
import { protectRoutes } from '../../../middleware/auth.js';
const bookRouter=Router();
bookRouter.post('/addBook',bookController.addBook);
bookRouter.put('/issuedBook',bookController.issuedBook);
bookRouter.get('/searchBook',bookController.searchBook);
bookRouter.get('/allBooks',bookController.allBook);
bookRouter.get('/allBooksIssued',bookController.allBooksIssued);
bookRouter.get('/issuedBookUser',bookController.issuedBookUser);
bookRouter.get('/allNotReturnedBooks',bookController.allNotReturnedBooks);
export default bookRouter;