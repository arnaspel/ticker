

const getTick = async (req, res) => {
    console.log('[GOT REQUEST]', req.body);
    res.status(200).json({test: "OK"});
};

module.exports = {
  getTick,
};
