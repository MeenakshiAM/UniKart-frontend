const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    success: false,
    message: err.message || 'Server Error'
  };

  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    return res.status(404).json(error);
  }

  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    return res.status(400).json(error);
  }

  res.status(500).json(error);
};

module.exports = errorHandler;
