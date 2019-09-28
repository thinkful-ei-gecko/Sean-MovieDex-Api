'use strict';

const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const { bookmarks } = require('../store');

const bookmarksRouter = express.Router();
const bodyParser = express.json();


bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const { title, url, rating='', description='' } = req.body;
        let urlVerification = url.slice(0,4);
        if(!title) {
            logger.error('Movie title is required');
            return res
                    .status(400)
                    .send('Invalid data - title not set');
        }

        if(!url) {
            logger.error('URL is Required');
            return res
                    .status(400)
                    .send('Invalid data - URL not set');
        }
        if(urlVerification !== 'http'){
            logger.error('Not a valid URL');
            return res
                    .status(400)
                    .send('You must enter a valid URL');
        }
        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            rating,
            description
        };
        bookmarks.push(bookmark);
        logger.info(`Bookmark with id ${id} has been created`);
        res 
            .status(201)
            .location(`http://localhost:8080/bookmarks/${id}`)
            .json(bookmark);
    });

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res)  => {
        const { id } = req.params;
        const parsedId = parseInt(id);
        const bookmark = bookmarks.find(b => b.id == parsedId );
        if(!bookmark) {
            logger.error(`Bookmark with id ${id} was not found.`);
            return res
                    .status(404)
                    .send('Bookmark was not found.');
        }
        res.json(bookmark);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);
        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} was not found`);
            return res
                    .status(404)
                    .send('The bookmark was not found');
        }
        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} has been deleted`);

        res
            .status(204)
            .end();
        });

module.exports = bookmarksRouter;

