const DB = require('../database');
const jwt = require('jsonwebtoken');
const {UserSchema, BookSchema} = require('../schemes');
const {JWT_PRIVATE_TOKEN} = require('../config');


const delete_book = (async function (req, res) {
    const token = req.cookies.JWT;
    const Users = DB.model('users', UserSchema);
    if (!token) {
      return res.sendStatus(403);
    }
    try {
        const idUser = jwt.verify(token, JWT_PRIVATE_TOKEN);
        const Query = { 
            __v: false,
            password: false
        };
        if (req.body["book_name"]) {
            const userData = await Users.findOne({_id: idUser['data']},Query).exec();
            const Books = userData["books"];
            const bookName = req.body["book_name"];
            Reflect.deleteProperty(Books, bookName);
            const deleteBookRequest = await Users.updateOne({_id: idUser['data']}, { $set: {books:Books}}).exec();
            return deleteBookRequest.modifiedCount ? res.sendStatus(200) : res.sendStatus(400);
        }
    } catch (err) {
        console.log(err);
    }
})

const change_book_rating = (async function (req, res) {
    const token = req.cookies.JWT;
    const Users = DB.model('users', UserSchema);
    if (!token) {
      return res.sendStatus(403);
    }
    try {
        const idUser = jwt.verify(token, JWT_PRIVATE_TOKEN);
        const Query = { 
            __v: false,
            password: false
        };
        if (req.body["book_name"] && req.body["rating"]) {
            const userData = await Users.findOne({_id: idUser['data']},Query).exec();
            let Books = userData["books"];
            const BookName = req.body["book_name"];
            Books[BookName]["rating"] = req.body["rating"];
            const updatedRating = await Users.updateOne({_id: idUser['data']}, { $set: {books:Books}}).exec();
            return updatedRating.modifiedCount ?  res.sendStatus(200):res.sendStatus(400);
        }
    } catch (err) {
        console.log(err);
    }
})

const library_add_book = (async function (req, res) {
    const token = req.cookies.JWT;
    const Users = DB.model('users', UserSchema);
    if (!token) {
        return res.json({message: "?????? ?????????? ???????????? ?????????? ??????????????????????", codeStatus:403});
    }
    try {
        const idUser = jwt.verify(token, JWT_PRIVATE_TOKEN);
        const Query = { 
            __v: false,
            password: false
        };
        const userData = await Users.findOne({_id: idUser['data']},Query);
        if (userData["role"] === 2 || userData["role"] === 3) {
            const Books = DB.model('books', BookSchema);
            const BookName = req.body["book_name"];
            const BookAuthor = req.body["book_author"];
            const YearOfRelease = req.body["year_of_release"];
            const BookCover = req.body["cover"];
            const createBook = await Books.create({book_name:BookName,book_author:BookAuthor,year_of_release:YearOfRelease,cover:BookCover}).exec();
            return createBook.modifiedCount ?  res.sendStatus(200):res.sendStatus(400);
        } else {
            return res.json({message: "?? ?????? ?????? ???????????? ????????!", codeStatus:403});
        }
    } catch (err) {
        console.log(err);
    }
})

const get_library_books = (async function (req, res) {
    const books = DB.model('books', BookSchema);
    const query = { 
        __v: false,
         _id: false
    };
    const bookData = await books.find({},query).exec();
    return res.json(bookData);
})

const add_book = (async function (req, res) {
    const token = req.cookies.JWT;
    const Users = DB.model('users', UserSchema);
    if (!token) {
        return res.json({message: "?????? ?????????? ???????????? ?????????? ??????????????????????", codeStatus:403});
    }
    try {
        const idUser = jwt.verify(token, JWT_PRIVATE_TOKEN);
        const Query = { 
            __v: false,
            password: false
        };
        const authUser = await Users.findOne({_id: idUser['data']},Query).exec();
        const Books = Object.assign(authUser["books"],{
            [req.body["book_name"]]: {
                book_author: req.body["book_author"],
                year_of_release: req.body["year_of_release"],
                rating:0,
                book_status:req.body["book_status"], // readed | drop | planned
                cover:req.body["cover"],
                slug:req.body["slug"]
            }});
        const updateBooks = await Users.updateOne({_id: idUser['data']}, { $set: {books:Books}}).exec();
        return updateBooks.modifiedCount ?  res.sendStatus(200):res.sendStatus(400);
    } catch (e) {
        console.log(e);
        return res.json({message: "?????? ?????????? ???????????? ?????????? ??????????????????????", codeStatus:403});
    }
})

const get_book_by_slug = (async function (req, res) {
    const slug = req.body["slug"];
    const Books = DB.model('books', BookSchema);
    const bookQuery = {__v: false,_id: false};
    try {
        if (slug) {
            const dataSearchSlug = await Books.findOne({slug: slug},bookQuery).exec();
            return dataSearchSlug ? res.json(dataSearchSlug):res.sendStatus(404);
        }
    } catch (e) {
        console.log(e)
    }
})

const change_cover_by_slug = (async function (req, res) {
    const slug = req.body["slug"];
    const newCover = req.body["cover"];
    const books = DB.model('books', BookSchema);
    const users = DB.model('users', UserSchema);
    const token = req.cookies.JWT;
    if (!token) {
        return res.json({message: "?????? ?????????? ???????????? ?????????? ??????????????????????", codeStatus:403});
    }
    try {
        const idUser = jwt.verify(token, JWT_PRIVATE_TOKEN);
        const authUser = await users.findOne({_id: idUser['data']}).exec();
        if (authUser && authUser.role === 3) {
            if (slug && newCover) {
                const bookUpdated =  await books.updateOne({slug: slug}, { $set: {cover:newCover}}).exec();
                return bookUpdated.modifiedCount ? res.sendStatus(201):res.sendStatus(400);
            } else {
                return res.json({message: "?????? ?????????? ???????????? ?????????? ???????? ??????????????????????????????", codeStatus:403});
            }

        } else {
            return res.json({message: "?????? ?????????? ???????????? ?????????? ???????? ??????????????????????????????", codeStatus:403})
        }
    } catch (e) {
        console.log(e)
    }
})

const get_cover_by_name = (async function (req, res) {
    const bookName = req.body["book_name"];
    const Books = DB.model('books', BookSchema);
    const bookQuery = {__v: false,_id: false};
    try {
        if (bookName) {
            let bookData = await Books.findOne({book_name: bookName},bookQuery).exec();
            if (bookData === null) bookData = false
            return bookData ? res.json(bookData):res.sendStatus(404);
        } else {
            return res.sendStatus(400);
        }
    } catch (e) {
        console.log(e)
    }
})

const search_books = (async function (req, res) {
    const textQuery = req.body["text"];
    const bookQuery = {__v: false,_id: false};
    const books = DB.model('books', BookSchema);
    const searchByName = await books.find({book_name: textQuery},bookQuery).exec();
    const searchByAuthor = await books.find({book_author: textQuery},bookQuery).exec();
    return Boolean(searchByName) ? res.json(searchByName):res.json(searchByAuthor);
})

module.exports = {
    delete_book,change_book_rating,
    library_add_book,
    get_library_books,add_book,
    get_book_by_slug,change_cover_by_slug,
    get_cover_by_name,search_books
};