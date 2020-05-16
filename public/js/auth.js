window.addEventListener('load', () => {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const authContainer = document.getElementById('authContainer');

    signUpButton.addEventListener('click', () => authContainer.classList.add('right-panel-active'));
    signInButton.addEventListener('click', () => authContainer.classList.remove('right-panel-active'));

    $('#signUpBtn').click(function(){
        var newUser = {
          studentName: $('#regName').val(),
          studentId: $('#regId').val(),
          password: '',
          isAdmin: false
        };

        var regName = $("#regName").val();
        var regId = $("#regId").val();
        var regPass1 = $("#regPass1").val();
        var regPass2 = $("#regPass2").val();

        if(regName === '')$('#regName').addClass('border border-danger');
        else $('#regName').removeClass('border-danger');

        if(regId === '') $('#regId').addClass('border border-danger');
        else $('#regId').removeClass('border-danger');

        if((regPass1 === regPass2) && (regPass1 != '')){
            $('#regPass1').removeClass('border-danger');
            $('#regPass2').removeClass('border-danger');
            newUser.password = regPass1;
            $('#securityModal').modal('show');
                $('#chooseQuestion').change(function() {
                    var chosen = $(this).children("option").filter(":selected").val();
                    $('#submitSecBtn').click(function(){
                        var answer = $('#securityAnswer').val();
                        console.log(chosen);
                        console.log(answer);
                        if (answer === ''){
                            $('#msg').addClass('text-danger');
                            $('#msg').removeClass('text-success');
                            $('#msg').text('Please enter necessary information!');
                        }
                        else {
                            var security = {
                                idNum: regId,
                                securityQ: chosen,
                                securityA: answer
                            } 
                            $.post('/addFallback', security, function(data, status){
                                console.log(security)
                                if(data.success){
                                    $('#securityModal').modal('hide');
                                }
                            });

                            $.post('/addUser', newUser, function(data, status) {
                                if (data.success) {
                                    $('#msg1').addClass('text-success');
                                    $('#msg1').removeClass('text-danger');
                                    $('#msg1').text(data.message);
                                    $("#regName").val('');
                                    $("#regId").val('');
                                    $("#regPass1").val('');
                                    $("#regPass2").val('');
                                } else {
                                    $('#msg1').addClass('text-danger');
                                    $('#msg1').removeClass('text-success');
                                    $('#msg1').text(data.message);
                                }
                            });
                        }
                    });
                });
        } else{
            $('#regPass1').addClass('border border-danger');
            $('#regPass2').addClass('border border-danger');
            $('#msg1').addClass('text-danger');
            $('#msg1').removeClass('text-success');
            $('#msg1').text('Please enter necessary information!');
        }
    });

    $('#signInBtn').click(function(){
        var user = {
          studentId: $('#siId').val(),
          password: $('#siPass').val(),
        };

        var studentId = $('#siId').val();
        var password = $('#siPass').val();

        if(studentId === '' || password === ''){
            if(studentId === ''){
                $('#siId').addClass('border border-danger');
            } else{
                $('#siId').removeClass('border-danger');
            }

            if(password === ''){
                $('#siPass').addClass('border border-danger');
            } else{
                $('#siPass').removeClass('border-danger');
            }

            $('#msg2').addClass('text-danger');
            $('#msg2').removeClass('text-success');
            $('#msg2').text('Please enter necessary information!');
        } 
        else{
            $.post('/auth', user, function(data, status) {
                if(data.success) {
                    $('#msg2').addClass('text-success');
                    $('#msg2').removeClass('text-danger');
                    $('#msg2').text(data.message);
                    $("#siId").val('');
                    $('#siId').removeClass('border-danger');
                    $("#siPass").val('');
                    $('#siPass').removeClass('border-danger');
                    var delay = 2000; 
                    setTimeout(function(){ window.location = '/'; }, delay);
                } else {
                    if(data.status == 0) {
                        $('#siPass').addClass('border border-danger');
                        $('#siId').removeClass('border-danger');
                    } else {
                        $('#siId').addClass('border border-danger');
                        $('#siPass').removeClass('border-danger');
                    }
                    $('#msg2').addClass('text-danger');
                    $('#msg2').removeClass('text-success');
                    $('#msg2').text(data.message);
                }
            });
        }
    });
    
//forgot password

    $('#forgotSubmitBtn').click(function(){
        var id = $('#idNum').val();
        $.get('/getSecQuestion', id, function (data, status) {
    
            if(data === "No User Found!"){
                alert(data);
            }
            else
            {
                $('#forgotModal').modal('hide');
                $('#verifyModal').modal('show');
                var verifyAnswer = $('#securityAns').val();
                document.getElementById('secQuestion').value = data.question;
            }
        });
        
    });

    $('#submitVerifBtn').click(function(){
        var security = {
            id: $('#idNum').val(),
            answer: $('#securityAns').val()
        };

        //alert(security.id + " " + security.answer);

        $.get('/verifySecAnswer', security, function (data, status) {
            if(data === "Answers mismatch!"){   
                alert("Wrong security answer!");
                $('#vmsg').text('Answers Mismatched');
                document.getElementById('securityAns').value = "";
                document.getElementById('idNum').value = "";
            }
            else
            {
                $('#verifyModal').modal('hide');
                $('#newPasswordModal').modal('show');

            }
        });
    });

     $('#newPasswordBtn').click(function(){

        var pass1 = $('#pass1').val();
        var pass2 = $('#pass2').val();

       // alert(pass1 + " " + pass2);

        if(pass1 === pass2){

            var security = {
                id: $('#idNum').val(),
                password: pass1
            };
            $.post('/setNewPassword', security, function (data, status) {
                $('#nmsg').text('Password changed!');
                var delay = 2000; 
                setTimeout(function(){ window.location = '/'; }, delay);
            });
        }
        else{
            $('#nmsg').text('Passwords Mismatched');
            $('#pass1').val() = "";
            $('#pass2').val() = "";
        }
    });
});