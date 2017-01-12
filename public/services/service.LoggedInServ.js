angular.module('service.LoggedInServ', [ 'ngCookies'])

.service('LoggedInServ', function($http, $state, $cookies){
    var LoggedInService = this;
    var loggedIn = $cookies.get('isLoggedIn');
    this.submitLogin = function(username, password){
        var url = 'berlinevents/login';
        var userData = { username, password };
        var jsonData = JSON.stringify(userData);
        return $http.post(url, jsonData)
        .then(function(result){
            LoggedInService.username = result.data.username;
            console.log(LoggedInService);
            console.log(result.data.username);
            // console.log(loggedIn);
            // console.log(result.data);
            console.log('this is successful');
            $cookies.put('isLoggedIn', true);
            loggedIn = true;
            $cookies.put('username', LoggedInService.username);
            // $state.go('home');
        })
        .catch(function(err){
            console.log(err);
        });
    };
    this.checkIfLoggedIn = function(){
        return loggedIn;

    };
    this.logout = function(){
        loggedIn = false;
        $cookies.remove('isLoggedIn');
        delete LoggedInService.username;
    };
    this.registerUser = function(){
        loggedIn = true;
        $cookies.put('isLoggedIn', true);
    };
    this.getUsername = function(){
        return new Promise(function(resolve, reject){
            if (LoggedInService.username) {
                resolve(LoggedInService.username);
            } else {
                $http.get('/getUserinfo').then(function(result){
                    LoggedInService.username = result.data.username;
                    resolve(result.data.username);
                });
            }

        });

    };
})
