var sw=20,//行宽
    sh=20,//行高
    tr=24,//行
    td=24;//列
var snack=null,
    food=null,
    game=null;

function Square(x,y,classname) { //(x,y) 坐标
    this.x=x*sw;
    this.y=y*sh;
    this.class=classname;
    this.viewContent=document.createElement('div');  //方块对应的DOM元素
    this.viewContent.className=this.class;
    this.parent=document.getElementById('main');//方块父级
}

Square.prototype.create=function () { //创建方块DOM,并添加到页面中
    this.viewContent.style.position='absolute';
    this.viewContent.style.width=sw+'px';
    this.viewContent.style.height=sh+'px';
    this.viewContent.style.left=this.x+'px';
    this.viewContent.style.top=this.y+'px';

    this.parent.appendChild(this.viewContent);
}

Square.prototype.remove=function () {
    this.parent.removeChild(this.viewContent);
}

function Snake() {
    this.head=null;  //头部
    this.tail=null;
    this.pos=[];   //储存坐标
    this.directionNum={  //方向
        left:{
            x:-1,
            y:0,
            rotate:-90
        },
        right:{
            x:1,
            y:0,
            rotate:90
        },
        up:{
            x:0,
            y:-1,
            rotate: 0
        },
        down:{
            x:0,
            y:1,
            rotate:180
        }
    }
}

Snake.prototype.init=function () {
    var snakeHead=new Square(1,0,'snakeHead');
    var snakeTail=new Square(0,0,'snakeBody');
    snakeHead.create();
    snakeTail.create();
    this.head=snakeHead;  //存储头部坐标
    this.tail=snakeTail;
    this.pos.push([1,0]);
    this.pos.push([0,0]);

    snakeHead.last=null;
    snakeHead.next=snakeTail;
    snakeTail.last=snakeHead;
    snakeTail.next=null;

    this.direction=this.directionNum.right;
}

//下一步
Snake.prototype.getNextPos=function(){
    var nextPos=[
        this.head.x/sw+this.direction.x,
        this.head.y/sh+this.direction.y
    ]
    console.log(nextPos);
    var selCollied=false; //是否撞到了自己
    this.pos.forEach(function (value) {
        if(value[0]==nextPos[0]&&value[1]==nextPos[1]){
            selCollied=true;
        }
    });
    if (selCollied) {
        console.log("撞到了自己！！！");
        this.strategies.die.call(this);
        return;
    }
    if (nextPos[0]<0||nextPos[1]<0||nextPos[0]>tr-1||nextPos[1]>td-1) {
        console.log("撞到了墙！！！");
        console.log(nextPos[0]);
        console.log(nextPos[1]);
        this.strategies.die.call(this);
        return;
    }
    if(food && food.pos[0]==nextPos[0] &&food.pos[1]==nextPos[1]){
        console.log("撞到食物");
        this.strategies.eat.call(this);
    }
    this.strategies.move.call(this);
};

Snake.prototype.strategies={
    move:function (format) {
        console.log('move');
        var newBody=new Square(this.head.x/sw,this.head.y/sh,'snakeBody');
        //更新链表关系

        newBody.next=this.head.next;
        newBody.last=null;
        newBody.next.last=newBody;

        this.head.remove();
        newBody.create();
        //创建一个新的贪吃蛇蛇头
        var newHead=new  Square(this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y,'snakeHead')
        newHead.next=newBody;
        newHead.last=null;
        newBody.last=newHead;
        newHead.viewContent.style.transform='rotate('+ this.direction.rotate+'deg)';
        newHead.create();

        this.pos.splice(0,0,[this.head.x/sw+this.direction.x,this.head.y/sh+this.direction.y]);
        this.head=newHead;

        if(!format){
            this.tail.remove();
            this.tail=this.tail.last;
            this.pos.pop();
        }
    },
    eat:function () {
        console.log('eat');
        this.strategies.move.call(this,true)
        createFood();
        game.score++;
    },
    die:function () {
        console.log('die');
        game.over();
    }
}

snack=new Snake();
// snack.init();
// snack.getNextPos();

function createFood() {
    var x=null;
    var y=null;   //食物坐标
    var include=true; //食物坐标是否冲突
    while(include){
        x=Math.round(Math.random()*(td-1));
        y=Math.round(Math.random()*(tr-1));
        snack.pos.forEach(function (value) {
            if(x!= value[0]&&y!= value[1]){
                include=false;
            }
        })
    }
    food=new Square(x,y,'food');
    food.pos=[x,y];
    console.log(food.pos);
    var foodDom=document.querySelector('.food');
    if(foodDom){
        foodDom.style.left=x*sw+'px';
        foodDom.style.top=x*sh+'px';
    }else {
        food.create();
    }

}

// createFood();

function Game() {
    this.timer=null;
    this.score=0;
}
Game.prototype.init=function () {
    snack.init();
    createFood();
    document.onkeydown=function (event) {
        switch(event.keyCode){
            case 37:
                snack.direction= snack.directionNum.left;
                console.log("left");
                break;
            case 38:
                snack.direction= snack.directionNum.up;
                console.log("up");
                break;
            case 39:
                snack.direction= snack.directionNum.right;
                console.log("right");
                break;
            case 40:
                snack.direction= snack.directionNum.down;
                console.log("down");
                break;
            default:
                break;
        }
    }
    this.start();
}
Game.prototype.start=function(){
    this.timer=setInterval(function () {
        snack.getNextPos();
    },200)
}
Game.prototype.over=function(){
    clearInterval(this.timer);
    alert('你的分数为：'+this.score)
    var main=document.getElementById('main');
    main.innerText='';
    snack=new Snake();
    game=new Game();
    var startBtnWrap=document.querySelector('.startBtn');
    startBtnWrap.style.display='block';
}
Game.prototype.pause=function(){
    clearInterval(this.timer);
}
game=new Game();

var startBtn=document.querySelector("#start");
startBtn.onclick=function(){
    startBtn.parentNode.style.display='none';
    game.init();
};
var snackWrap=document.getElementById('main');
var pauseBtn=document.querySelector('#pause');
snackWrap.onclick=function () {
    game.pause();
    pauseBtn.parentNode.style.display='block';
}
pauseBtn.onclick=function () {
    game.start();
    pauseBtn.parentNode.style.display='none';
}

