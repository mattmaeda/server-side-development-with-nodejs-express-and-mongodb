const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
const Dishes = require('../models/dishes');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const cors = require('./cors');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('favorites')
    .then((favorite) => {
        var newFavorite;

        if (!favorite) {
            newFavorite = new Favorites({user: req.user._id});
        } 
        else {
            newFavorite = favorite;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(newFavorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {

        if (!favorite) {
            favorite = new Favorites({user: req.user._id});
        } 

        if (favorite.favorites.indexOf(req.body._id) === -1) {
            favorite.favorites.push(req.body._id);                
        }
        else {
            console.log("Dish already a favorite");
        }

        favorite.save()

        Favorites.findOne({user: req.user._id})
        .populate('user')
        .populate('favorites')
        .then((newFavorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newFavorite);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            favorite.remove()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
        }
        else {
            var err = new Error("You do not have any favorites");
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        var message;
        var exists = false;

        if (favorite) {
            if (favorite.favorites.indexOf(req.params.dishId) < 0) {
                message = "Not saved as a favorite dish";
            }
            else {
                message = "Dish is one of your favorites";
                exists = true;
            }
        }
        else {
            message = "You do not have any favorites";
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({"exists": exists, "message": message});

    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {

        if (!favorite) {
            favorite = new Favorites({user: req.user._id});
        } 

        if (favorite.favorites.indexOf(req.params.dishId) === -1) {
            favorite.favorites.push(req.params.dishId);                
        }
        else {
            console.log("Dish already a favorite");
        }

        favorite.save()

        Favorites.findOne({user: req.user._id})
        .populate('user')
        .populate('favorites')
        .then((newFavorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(newFavorite);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /favorites/:dishId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite) {
            var index = favorite.favorites.indexOf(req.params.dishId);

            if (index === -1) {
                var err = new Error("Dish is not currently saved as a favorite");
                err.status = 404;
                return next(err);
            }
            else {
                favorite.favorites.splice(index, 1);
            }

            favorite.save()

            Favorites.findOne({user: req.user._id})
            .populate('user')
            .populate('favorites')
            .then((updatedFavorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(updatedFavorite);
            }, (err) => next(err));
        } else {
            var err = new Error("You do not have any favorites");
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;