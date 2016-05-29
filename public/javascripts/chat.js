$(document).ready(function() {
  $(window).keydown(function (e) {
    if (e.keyCode == 116) {
      if (!confirm("刷新将会清除所有聊天记录，确定要刷新么？")) {
        e.preventDefault();
      }
    }
  });
  var socket = io.connect();
  var from = $('#contain').attr('name');//从 cookie 中读取用户名，存于变量 from
  var to = 'all';//设置默认接收对象为"所有人"
  //发送用户上线信号
  socket.emit('online', {userName: from});
  socket.on('online', function (data) {
    //显示系统消息
    if (data.userName != from) {
      var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.userName + ' 上线了！</div>';
    } else {
      var sys = '<div style="color:#f00">系统(' + now() + '):你进入了聊天室！</div>';
    }
    $("#contents").append(sys + "<br/>");
    //刷新用户在线列表
    flushUsers(data.users);
    //显示正在对谁说话
    showSayTo();
  });

  socket.on('chat', function (data) {
      $("#contents").append('<div style="color:#00f">' + data.from + '(' + now() + ')对 所有人 说：<br/>' + data.msg + '</div><br />');
  });

  //重新启动服务器
  socket.on('reconnect', function() {
    //console.log('reconnect');
    var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';
    $("#contents").append(sys + "<br/>");
    socket.emit('online', {userName: from});
    // flushUsers(data.users);
  });

  socket.on('offline', function (data) {
    //显示系统消息
    //console.log(data);
    var sys = '<div style="color:#f00">系统(' + now() + '):' + '用户 ' + data.userName + ' 下线了！</div>';
    $("#contents").append(sys + "<br/>");
    //刷新用户在线列表
    flushUsers(data.users);
    //如果正对某人聊天，该人却下线了
    // if (data.user == to) {
    //   to = "all";
    // }
    //显示正在对谁说话
    showSayTo();
  });

  //服务器关闭
  socket.on('disconnect', function() {
    var sys = '<div style="color:#f00">系统:连接服务器失败！</div>';
    $("#contents").append(sys + "<br/>");
    $("#list").empty();
  });

  //重新启动服务器
  // socket.on('reconnect', function() {
  //   var sys = '<div style="color:#f00">系统:重新连接服务器！</div>';
  //   $("#contents").append(sys + "<br/>");
  //   socket.emit('online', {user: from});
  // });

  //刷新用户在线列表
  function flushUsers(users) {
    //清空之前用户列表，添加 "所有人" 
    $("#list").empty().append('<li title="所有人" alt="all" class="sayingto" onselectstart="return false">所有人</li>');
    //遍历生成用户在线列表
    for (var i in users) {
      $("#list").append('<li alt="' + users[i] + '" title="'+users[i]+'" onselectstart="return false">' + users[i] + '</li>');
    }
  }

  //显示正在对谁说话
  function showSayTo() {
    $("#from").html(from);
    $("#to").html("所有人");
  }

  //获取当前时间
  function now() {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }

  //说话
  $("#say").click(function() {
    //获取要发送的信息
    var $msg = $("#input_content").html();
    if ($msg == "") return;
    $("#contents").append('<div style="text-align:right;">你(' + now() + ')对 所有人 说：<br/>' + $msg + '</div><br />');
    //发送发话信息
    socket.emit('chat', {from: from, to: to, msg: $msg});
    //清空输入框并获得焦点
    $("#input_content").html("").focus();
  });
});
