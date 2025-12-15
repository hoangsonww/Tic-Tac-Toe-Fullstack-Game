const { body, validationResult } = require('express-validator');

const validateLeaderboardMatch = [
    body('player').exists().withMessage('Player is required').isString(),
    body('opponent').optional().isString(),
    body('result').exists().isIn(['win', 'loss', 'draw']).withMessage('Result must be one of win/loss/draw'),
    body('difficulty').exists().isIn(['easy', 'medium', 'hard', 'impossible']).withMessage('Difficulty must be one of easy/medium/hard/impossible'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateLeaderboardMatch };
