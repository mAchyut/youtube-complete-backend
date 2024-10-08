// const asyncHandler = (handlerFunction) => async (req, res, next) => {
//   try {
//     await handlerFunction(req, res, next);
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

// export default asyncHandler;

const asyncHandler = (handlerFunction) => (req, res, next) => {
  Promise.resolve(handlerFunction(req, res, next)).catch((error) => {
    next(error);
  });
};

export default asyncHandler;
