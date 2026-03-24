// Standardised API response helpers

const success = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  })
}

const error = (res, message = 'Something went wrong', status = 500, errors = null) => {
  return res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
  })
}

const paginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  })
}

module.exports = { success, error, paginated }
