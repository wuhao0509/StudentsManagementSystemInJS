var page = 1,
    size = 5,
    cont = 0;//学生总人数
var studentsList = [];

function bindEvent() {
    var menuList = document.getElementsByClassName('menu')[0];
    menuList.onclick = function (e) {
        // console.log(e.target.nodeName)
        if (e.target.nodeName == 'DD') {
            // for (var i = 0; i < this.children.length; i++) {
            //     this.children[i].classList.remove('active');
            // }
            var etarSib = getSiblings(e.target);
            etarSib.forEach(function (elem, index) {
                elem.classList.remove('active');
            })

            e.target.classList.add('active');
            var id = e.target.getAttribute('data-id');

            var showContent = document.getElementById(id);
            var sContSib = getSiblings(showContent);
            sContSib.forEach(function (elem, index) {
                elem.style.display = 'none';
            })
            showContent.style.display = 'block';
        }
    }

    var submit = document.getElementById('student-add-submit');
    submit.onclick = function (e) {
        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
        console.log(data);
        if (data) {
            transferData('/api/student/addStudent', data, function (result) {
                window.alert(result.msg);

                var form = document.getElementById('student-add-form');
                form.reset();
                getTableData();
            })
        }
        e.preventDefault();
    }

    var tbody = document.getElementById('tbody');
    var modal = document.getElementsByClassName('modal')[0];
    tbody.onclick = function (e) {
        if (e.target.classList.contains('edit')) {
            modal.style.display = 'block';
            var studentData = studentsList[e.target.dataset.index];
            backData(studentData);
        } else if (e.target.classList.contains('del')) {
            var isDel = confirm('确定删除吗')
            if (isDel) {
                var studentSno = studentsList[e.target.dataset.index].sNo;
                console.log(studentSno)
                transferData('/api/student/delBySno', {
                    sNo: studentSno
                }, function (result) {
                    window.alert(result.msg);
                    getTableData();
                })
            }

        }
    }
    modal.onclick = function (e) {
        if (e.target == modal) {
            modal.style.display = 'none';
        }

    }

    var editBtn = document.getElementById('student-add-submit-edit');
    var editForm = document.getElementById('student-add-form-edit');
    editBtn.onclick = function (e) {
        var data = getFormData(editForm);
        console.log(data);
        transferData('/api/student/updateStudent', data,function(result){
            window.alert(result.msg);
            modal.style.display = 'none';
        })
        getTableData();
        e.preventDefault();
    }

    var preBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    nextBtn.onclick = function(){
        page+=1;
        getTableData();
        console.log(cont);
        if(cont-page*size<0){
            this.style.display='none';
            
        }
        preBtn.style.display='inline-block';
    }
    preBtn.onclick = function(){
        page-=1;
        if(page == 1){
            this.style.display='none';
            
        }
        nextBtn.style.display='inline-block';
        getTableData();
    }

    //获取兄弟结点
    function getSiblings(node) {
        var siblings = [];
        var children = node.parentElement.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i] != node) {
                siblings.push(children[i]);
            }
        }
        return siblings;
    }

    // 获取表单数据
    function getFormData(form) {
        var name = form.name.value;
        var sex = form.sex.value;
        var sNo = form.sNo.value;
        var email = form.email.value;
        var birth = parseInt(form.birth.value);
        var phone = form.phone.value;
        var address = form.address.value;

        return {
            sNo: sNo,
            name: name,
            sex: parseInt(sex),
            birth: birth,
            phone: phone,
            address: address,
            email: email
        }
    }

    // 利用savaData函数向后台传数据
    function transferData(url, data, success) {
        data.appkey = 'qiqiqi_1569759019786';
        var result = saveData('http://open.duyiedu.com' + url, data);
        if (result.status == 'success') {
            success(result);
        } else {
            window.alert(result.msg);
        }
    }

    //从后台获取学生信息
    function getTableData() {
        transferData('/api/student/findByPage', {
            page: page,
            size: size
        }, function (result) {
            console.log(result);
            cont = result.data.cont;
            renderTable(result);
        })
    }

    //渲染学生列表
    function renderTable(result) {
        var str = '';
        var renderList = result.data.findByPage;
        var thisYear = new Date().getFullYear();
        renderList.forEach(function (elem, index) {
            str += `
            <tr>
                <td>${elem.sNo}</td>
                <td>${elem.name}</td>
                <td>${elem.sex==0?'男':'女'}</td>
                <td>${elem.email}</td>
                <td>${thisYear - elem.birth +1}</td>
                <td>${elem.phone}</td>
                <td>${elem.address}</td>
                <td>
                    <button class="edit btn" data-index='${index}'>编辑</button>
                    <button class="del btn" data-index='${index}'>删除</button>
                </td>
            </tr>
        `

            studentsList.push(elem);
        })


        var tbody = document.getElementById('tbody');
        tbody.innerHTML = str;
    }

    //数据回填
    function backData(data) {
        var editForm = document.getElementById('student-add-form-edit');
        console.log(data)
        // form.name.value = data.name;
        for (var prop in data) {
            if (editForm[prop]) {
                editForm[prop].value = data[prop];
            }
        }
    }

    getTableData();
}

bindEvent();

var studentListLeft = document.getElementsByClassName('student-list-left')[0];
studentListLeft.click();

/**
 * 向后端存储数据
 * @param {*} url 
 * @param {*} param 
 */
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}