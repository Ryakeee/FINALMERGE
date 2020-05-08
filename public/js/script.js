window.addEventListener('load', () => {
  var profRef = '';
  var profNumber = 0;

  $('#addReview').click(function() {
    var newReview = {
      profRef: window.profRef,
      profNumber: window.profNumber,
      profCourse: $('#revProfCourse').find(":selected").text(),
      studentRef: window.studentRef,
      studentId: window.studentId,
      reviewContent: $("textarea#revContent").val()
    };

    $.post('/addReview', newReview, function(data, status) {
      console.log(data);

      if (data.success) {
        $('#msg').addClass('text-success');
        $('#msg').removeClass('text-danger');
        $('#msg').text('Successfully added review!');
        $('textarea#revContent').val('');
      } else {
        $('#msg').addClass('text-danger');
        $('#msg').removeClass('text-success');
        $('#msg').text('Error in adding review!');
      }
    });
  });

      // POST called
  $('#addComment').click(function() {
    // Get the data from the form
    var newComment = {
      reviewRef: $('#reviewRef').text(),
      studentRef: $('#studentRef').text(),
      commentContent: $("textarea#commentContent").val()
    };

    $.post('/addComment', newComment, function(data, status) {
      console.log(data);

      if (data.success) {
        $('#msg').addClass('text-success');
        $('#msg').removeClass('text-danger');
        $('#msg').text('Successfully posted comment!');
        $('#reviewRef').val('');
        $('#studentRef').val('');
        $('textarea#commentContent').val('');
      } else {
        $('#msg').addClass('text-danger');
        $('#msg').removeClass('text-success');
        $('#msg').text('Error in adding comment!');
      }

    });
  });

  
  $(document).on('click', 'button[data-id]', function (e) {
    var id = $(this).data('id');
    var content = $(this).data('content');
    var course = $(this).data('course');
    var profName = $(this).data('profname');
 
    document.getElementById('modalReviewRef').value = id; 
    document.getElementById('modalCommentContent').innerHTML = content; 
    document.getElementById('modalEditPostCourse').value = course;  
    document.getElementById('modalEditPostProfName').value = profName;       
  });

  $('#editPostClose').click(function(){
    document.getElementById('modalCommentContent').innerHTML = ""; 
    document.getElementById('modalEditPostCourse').value = "";  
    document.getElementById('modalEditPostProfessor').value = "";    
  });


  // POST called
  $('#savePost').click(function() {
    // Get the data from the form

    var post = {
      id:  $('#modalReviewRef').val(),
      content:  $('#modalCommentContent').val()
    };

    //alert(post.id + " " + post.content);
    $.post('/savePost', post, function(data, status) {
      //console.log(data);

      if (data.success) {
        $('#msg').addClass('text-success');
        $('#msg').removeClass('text-danger');
        $('#msg').text('Successfully saved post!');
        location.reload();
      } else {
        $('#msg').addClass('text-danger');
        $('#msg').removeClass('text-success');
        $('#msg').text('Error in saving post!');
      }
    });
  });


  $('#quickCollege').change(function() {
    var selectedCollege = $(this).children("option").filter(":selected").val();
    var course = document.getElementById('quickCourse');
    var prof = document.getElementById('quickProf');
    var courseItem = "<option hidden disabled selected value>Choose...</option>";
    prof.innerHTML = courseItem;
    $.get('/getCourseByCollege', selectedCollege, function(data, status) {
      $.each(data, function(index, value){
        courseItem += "<option>" + value + "</option>";
      });
      course.innerHTML = courseItem;
    });
  });

  $("#quickCourse").change(function() {
    var selectedCourse = $(this).children("option").filter(":selected").val();
    var prof = document.getElementById('quickProf');
    var profItem = "<option hidden disabled selected value>Choose...</option>";

    $.get('/getProfByCourse', selectedCourse, function(data, status) {
      $.each(data, function(index, value){
        profItem += "<option>" + value.profName + "</option>";
      });
      prof.innerHTML = profItem;
    });

    /*
    $('#postReview').click(function() {
      var newReview = {
        profRef: window.profRef,
        profNumber: window.profNumber,
        profCourse: $('#revProfCourse').find(":selected").text(),
        studentRef: window.studentRef,
        studentId: window.studentId,
        reviewContent: $("textarea#revContent").val()
      };

      $.post('/addReview', newReview, function(data, status) {
        console.log(data);

        if (data.success) {
          $('#msg').addClass('text-success');
          $('#msg').removeClass('text-danger');
          $('#msg').text('Successfully added review!');
          $('textarea#revContent').val('');
        } else {
          $('#msg').addClass('text-danger');
          $('#msg').removeClass('text-success');
          $('#msg').text('Error in adding review!');
        }

      });
    });
    */
  });


function defaultAdminTable () {
  var totalRows = $('#myTable tbody tr').length;
  var pages = totalRows/10;
  var pageList = document.getElementById('paging');
  var item = "";
  
  $('#myTable tbody tr').hide().slice(0, 10).show()

  for (var i = 1; i <= pages; i++)
  {
    item += '<li class="page-item"><a class="page-link">'+ i +'</a></li>';
  }
  pageList.innerHTML = item;

  $('#paging li').on( "click", function() {
    var pageNum = $(this).text();
    var x = parseInt(pageNum);
    //console.log (pageNum);
    //console.log(x);

    var start = 10 * x;
    var end = start + 10;

    $('#myTable tbody tr').hide().slice(start, end).show();
  });
  
}

defaultAdminTable();

$("#noEntries").change(function() {
  var maxRows = $(this).children("option").filter(":selected").val();
  var totalRows = $('#myTable tbody tr').length;
  
  var pages = totalRows/maxRows;
  var pageList = document.getElementById('paging');
  var item = "";
  $('#myTable tbody tr').hide().slice(0, maxRows).show();

  //console.log(maxRows);
  
  for (var i = 1; i <= pages; i++)
  {
    item += '<li class="page-item"><a class="page-link">'+ i +'</a></li>';
  }

  pageList.innerHTML = item;

  $('#paging li').click(function() {
    var pageNum = $(this).text();
    var x = parseInt(pageNum);
    //console.log(x);
    var start = maxRows * x;
    var end = start + maxRows;

    $('#myTable tbody tr').hide().slice(start, end).show();
    }); 
    
  });
/*
  $('#addUserBtn').click(function(){
    var password1 = $('#userPassword1').val();
    var passwword2 = $('')
  });


  function addUser () {
    var name = $('#userName').val();
    var idnum = $('#userIdNum').val();
    var password = $('#userPassword1').val();

  }

  addUser();
  */
  
});