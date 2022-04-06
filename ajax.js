function Ajax()
{
}

/**
 * get(<String> url,  <Function> success_callback)
 * get(<String> url, <Object> param, <Function> success_callback)
 */
Ajax.prototype.get = function(url, p1, p2)
{
    var success_callback = null;

    for (let p of [p1, p2]) {
        if (p instanceof Function) success_callback = p;
        else if (p instanceof Object && p != null) url += '?' + new URLSearchParams(p).toString();
    }

    return new Promise(function(resolve, reject) {
        
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function(oEvent) {

            if (xhr.status == 200) {
                if (success_callback instanceof Function) success_callback(this.responseText);
                resolve(this.responseText);
            }
            else {
                reject({ status: this.status,  statusText: xhr.statusText });
            }
        }

        xhr.onerror = function () {
            reject({ status: this.status,  statusText: xhr.statusText });
        }

        xhr.send();
    });
}


Ajax.prototype.post = function(url, data, success_callback)
{
    return new Promise(function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
        
        if (data instanceof FormData) { /* xhr.setRequestHeader("Content-Type", "multipart/form-data"); */ }
        else if (typeof data == 'object') {
            
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            var queryString = Object.keys(data).map((key) => {
                return encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
            }).join('&');
            data = queryString;
        }
        //else data == anything_else
        
        xhr.onload = function(oEvent) {

            if (xhr.status == 200) {
                if (success_callback instanceof Function) success_callback(this.responseText);
                else resolve(this.responseText);
            }
            else {
                reject({ status: this.status,  statusText: xhr.statusText });
            }
        }

        xhr.onerror = function () {
            reject({ status: this.status,  statusText: xhr.statusText });
        }

        xhr.send(data);
    });
}

Ajax.prototype.delete = function(url, p1, p2)
{
    var success_callback = null;

    for (let p of [p1, p2]) {
        if (p instanceof Function) success_callback = p;
        else if (p instanceof Object && p != null) url += '?' + new URLSearchParams(p).toString();
    }
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.onload = function(oEvent) {
        if (xhr.status == 200) {
            success_callback(this.responseText);
        }
    };
    xhr.send();
}

ajax = new Ajax();