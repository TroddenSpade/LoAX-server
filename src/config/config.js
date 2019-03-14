const config = {
    SECRET : "",
    PORT:3000,
    DATABASE : "mongodb://localhost:27017/loax",
    SECRET : "lakjsnf9awr9"
}

exports.get = function get(){
    return config;
};