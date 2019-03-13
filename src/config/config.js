const config = {
    SECRET : "",
    PORT:3000,
    DATABASE : "mongodb://localhost:27017/loax"
}

exports.get = function get(){
    return config;
};