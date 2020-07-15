var csv_file = null;
var base_url = "http://localhost:8080";


$("#csvfile").on('change', prepareUpload);

// Grabs the file that the user put into the file upload area
function prepareUpload(event)
{
    csv_file = event.target.files[0];
}

// runs with the "create" button on the form is pressed

$('#createButton').click(function(e){
    e.stopPropagation();
    e.preventDefault();

    var fd = new FormData();
    fd.append("datasetname", $("#datasetname").val());
    fd.append("csvfile", csv_file);
    fd.append("colorScheme", $("#colorSchemeDropdown").val());


    $.ajax({
        url: base_url + "/upload",
        data: fd,
        contentType: false, 
        processData: false,
        type: 'POST',
        success: function(data){
            console.log(data);
            console.log("success");

            var div = document.createElement('div');
            div.innerHTML = data;
            document.getElementById('appendtable').appendChild(div);

            $("#datasetname").val("");
            $("#csvfile").val(null);
            $("#colorSchemeDropdown").val(0);

            $("#collapseOne").collapse('hide');
        },
        failure: function(error) {
            console.log("error");
        }
    });

});