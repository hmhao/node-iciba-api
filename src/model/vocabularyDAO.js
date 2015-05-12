var mongodb = require('./../db/mongodb');
var Schema = mongodb.mongoose.Schema;
var VocabularySchema = new Schema({
    word: String,
    related: String,
    description: String,
    mp3: String
});
/**词汇*/
var Vocabulary = mongodb.mongoose.model('Vocabulary', VocabularySchema);

var VocabularyDAO = function () {
};
/**查询条件*/
var FIND_TYPE = {
    'find_all_word': {},
    'find_perfect_word': {"mp3": {"$nin": [""]}},
    'find_defect_word': {"mp3": {"$in": [""]}}
};
/**返回的字段*/
var fields = {
    _id: 0,
    word: 1,
    related: 1,
    description: 1,
    mp3: 1
};

VocabularyDAO.prototype.save = function (obj, callback) {
    var instance = new Vocabulary(obj);
    instance.save(function (err) {
        callback(err);
    });
};

VocabularyDAO.prototype.find = function (type, callback) {
    var criteria = FIND_TYPE[type] || {};
    Vocabulary.find(criteria, fields, function (err, obj) {
        callback(err, obj);
    });
};

VocabularyDAO.prototype.findByIdAndUpdate = function (obj, callback) {
    var _id = obj._id;
    delete obj._id;
    Vocabulary.findOneAndUpdate(_id, obj, function (err, obj) {
        callback(err, obj);
    });
};

VocabularyDAO.prototype.findByWord = function (word, callback) {
    Vocabulary.findOne({word: word}, function (err, obj) {
        callback(err, obj);
    });
};

VocabularyDAO.prototype.exist = function (word, callback) {
    Vocabulary.findOne({word: word}, function (err, obj) {
        obj = err ? null : obj;
        callback(obj);
    });
};

module.exports = new VocabularyDAO();
module.exports.FIND_ALL_WORD = 'find_all_word';
module.exports.FIND_PREFECT_WORD = 'find_perfect_word';
module.exports.FIND_DEFECT_WORD = 'find_defect_word';