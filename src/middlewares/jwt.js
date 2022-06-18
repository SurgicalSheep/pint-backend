const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("../models/redisDatabase");
const Utilizador = require("../models/utilizador");

const signAccessToken = (id) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "5m",
      subject: String(id),
    };
    jwt.sign(payload, process.env.TOKEN_KEY, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};

const signRefreshToken = async (id) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "7d",
      subject: String(id),
    };
    jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_KEY,
      options,
      async (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
        }

        try {
          await client.SET(String(id), token);
          await client.EXPIRE(String(id),7*24*60*60)
          resolve(token);
        } catch (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
      }
    );
  });
};

const verifyAccessToken = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization.split(" ")[1];
  if (!token) {
    return next(createError.Unauthorized());
  }
  jwt.verify(token, process.env.TOKEN_KEY, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.idUser = payload.sub;
    next();
  });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, async(err, payload) => {
      if (err) return reject(createError.Unauthorized());
      const userId = payload.sub;
      let token;
      try {
        token = await client.get(userId)
      } catch (err) {
        console.log(err.message)
        reject(createError.InternalServerError())
        return;
      }
      if(refreshToken === token) return resolve(userId)
      reject(createError.Unauthorized())
    });
  });
};

const isAdmin = async (req, res, next) => {
  let user = await Utilizador.findByPk(req.idUser);
  if (user.admin == true) {
    next();
    return;
  } else {
    return next(createError.Forbidden());
  }
};

module.exports = {
  signAccessToken: signAccessToken,
  signRefreshToken: signRefreshToken,
  verifyAccessToken: verifyAccessToken,
  verifyRefreshToken: verifyRefreshToken,
  isAdmin: isAdmin
};
