// Code goes here

var app = angular.module('myApp',["ngRoute"]).run(function($rootScope,$http,$location) {
  $http.get('isAuthenticated').then(function(data){
  console.log(data.data)
  $rootScope.authenticated = data.data.authenticate;
  $rootScope.current_user = data.data.user;
  $rootScope.user_id =data.data.id;
  })
  $rootScope.myMsg ="";
 $rootScope.mypoll = false;
  $rootScope.myPolls= function(){
  $rootScope.mypoll = true
  let id = $rootScope.user_id;
  $http.get('/posts/findmypost/'+id).then(function(data){
    total =[]
    var a = data.data[0];
    console.dir(a)
     for(var j=0;j<a.post.length;j++){
        total.push({name:a.post[j].name,options:a.post[j].option,count:a.post[j].count,ui:a.post[j].ui,id:a.id}) 
      }
     $rootScope.myMsg="You have created following polls so far"
     $location.path('/mypolls');

    })
  }
  
	
	$rootScope.logout = function(){
    	$http.get('/logout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
      alert('you are logged out')
      $location.path('/')
	  }
});
var p =[];
var count =0;
var optionCount =[];
var nameOfPole ="";
var total=[];
var pollsId={}
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.html",
        controller : "mainController"
    })
  .when("/mypolls", {
        resolve:{
        
          "check":function($rootScope,$location){
          if($rootScope.authenticated==false){
           $rootScope.msg= "You will have to login First";
           $location.path('/login');
           
           }
          }
        },
        templateUrl : "mypolls.html",
        controller : "mainController"
    })
    .when("/polls", {
        templateUrl : "polls.html",
        controller : "pollController"
    })
    .when("/createpoll", {
          resolve:{
          "check":function($rootScope,$location){
          if($rootScope.authenticated==false){
            $rootScope.msg = "You will have to login First";
           $location.path('/login');
           
           }
          }
        },
        templateUrl : "createpoll.html",
        controller : "createPollController"
    })
    .when("/login", {
      resolve:{
          "check":function($rootScope,$location){
           if($rootScope.authenticated==true){
            $location.path('/');
           }
          }
         },
        templateUrl : "login.html",
        controller : "authController"
    })
    .when("/register", {
      resolve:{
          "check":function($rootScope,$location){
           if($rootScope.authenticated==true){
            $location.path('/');
           }
          }
         },
        templateUrl : "register.html",
        controller : "authController"
    })
});

app.controller('authController',function($scope,$rootScope,$http,$location){
  $scope.msg=""
  $scope.user ={username:"",email:"",password:""};
  $scope.signuser={email:"",password:""};
  $scope.signup = function(){
     $http.post('/auth/signup', $scope.user).then(function(data){
        console.log(data);
        if(data.status==200&&data.data.state=='success'){
          $rootScope.current_user=data.data.user
          $rootScope.authenticated = true
          $location.path('/');
        }
       else if(data.status==200&&data.data.state=='failure'){
          $scope.msg =data.data.message;
          $location.path('/register')
       }
    }); 
  }
  
  $scope.login = function(){
     $http.post('/auth/login', $scope.signuser).then(function(data){
        console.log(data);
        if(data.status==200&&data.data.state=='success'){
          $rootScope.current_user=data.data.user
          $rootScope.authenticated = true
          $location.path('/');
        }
       else if(data.status==200&&data.data.state=='failure'){
          $scope.msg =data.data.message;
          $location.path('/login')
       }
    }); 
   }
  
})

app.controller('mainController',function($scope,$location,$http,$rootScope){
  
  optionCount=[];
  var newData={}
 
  
  if( $rootScope.mypoll ==false){
    total =[];
  $http.get('/posts/findAllPost').then(function(data){
    var a = data.data;
    
    for(var i=0;i<a.length;i++){
      for(var j=0;j<a[i].post.length;j++){
       total.push({name:a[i].post[j].name,options:a[i].post[j].option,count:a[i].post[j].count,ui:a[i].post[j].ui,id:a[i].id}) 
      }
    }
   })
  }
  
  $scope.posts =total;
  
   console.dir('hi'+$scope.posts)
   $scope.poll={};
   $scope.a=[];
   $scope.update=function(event){
   count =0;
   p=[];
     for(var i=0;i<$scope.posts.length;i++){
       if($scope.posts[i].name==event.target.innerHTML){
          $scope.poll=$scope.posts[i];
          console.log($scope.poll)
          nameOfPole= event.target.innerHTML
          break;
       }
     }
     optionCount =$scope.poll.count;
     p=$scope.poll.options;
     pollsId={ui:$scope.poll.ui,id:$scope.poll.id}
     
     $location.path('polls');
   }
   $rootScope.mypoll = false;
   
   
})



app.controller('createPollController',function($scope,$location,$http){
   $scope.pollName="";
   $scope.optionValue="";
   $scope.canCreate = true
   $scope.polls ={name:"",options:""}
   $scope.clicked = function(){
   var options =$scope.polls.options.split(";")
     if($scope.polls.name=="")
     {
       alert('name of pole could not be empty');
       $location.path('/createpoll')
     }
     else if($scope.polls.name=="" ||options.length<=1){
       alert('options field could not be ');
       $location.path('/createpoll')
     }
     else{
       $http.put('/posts/createPost', $scope.polls).then(function(data){
        alert('your poll created');
        $location.path('/');
      
        }) 
      }
     }
   
})


app.controller('pollController',function($scope,$http){
  console.log(optionCount);
    $scope.polls = p;
    $scope.nameOfPole = nameOfPole;
    $scope.votedFor="";
    $scope.selectedForm= function(){
      var x = $scope.votedFor;
      if(x==null)
      {
        alert('you are too funny, how can you vote without selecting the option?')
        }
      else{
      if(count==0){
        count=count+1;
       
        var bodyData ={
        ui:pollsId.ui,
        id:pollsId.id,
        count:$scope.votedFor,
        name: $scope.nameOfPole
    }
  
    $scope.obj=[];
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        for(var key in optionCount){
          if(key==$scope.votedFor){
            
            optionCount[key]=optionCount[key]+1; 
            console.log(optionCount[key])
          }
        }
        console.dir(optionCount) 
        var charted = [];
        for(var key in optionCount){
          var xx =[key,optionCount[key]];
          charted.push(xx);
          xx =[];
        }

        data.addRows(charted);

        // Set chart options
        var options = {'title':'How Many people have same choice as yours',
                       'width':350,
                       'height':300,
                       };
        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
        chart.draw(data, options);
        $http.put('posts/updateCount/count',bodyData).then(function(data){
        })
      }
      
   }
      else{
      alert('you cannot vote twice')
     }
      }
    }  
    
})