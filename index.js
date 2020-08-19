var nowPage = 1,
    pageSize = 5,
    allPage = 1;

var studentsList = [];

function bindEvent() {
    //选项卡切换事件
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

    //提交添加学生表单事件
    var submit = document.getElementById('student-add-submit');
    submit.onclick = function (e) {
        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
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

    //编辑表单数据回填及删除学生事件
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
                transferData('/api/student/delBySno', {
                    sNo: studentSno
                }, function (result) {
                    window.alert(result.msg);
                    studentsList.length--;
                    if(studentsList.length == 0){
                        var prevPage = document.getElementById('prev-btn');
                        prevPage.click();
                    }
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

    //编辑学生信息事件
    var editBtn = document.getElementById('student-add-submit-edit');
    var editForm = document.getElementById('student-add-form-edit');
    editBtn.onclick = function (e) {
        var data = getFormData(editForm);
        transferData('/api/student/updateStudent', data, function (result) {
            window.alert(result.msg);
            modal.style.display = 'none';
        })
        getTableData();
        e.preventDefault();
    }

    //翻页事件
    var turnPage = document.getElementsByClassName('turn-page')[0];
    turnPage.onclick = function (e) {
        if (e.target.id == 'next-btn') {
            nowPage++;
            getTableData();
        } else if (e.target.id == 'prev-btn') {
            nowPage--;
            getTableData();
        }
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
        data.appkey = 'wuhao_1585575377773';
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
            page: nowPage,
            size: pageSize
        }, function (result) {
            console.log(result)
            allPage = Math.ceil(result.data.cont / pageSize);
            renderTable(result);
        })
    }

    //渲染学生列表
    function renderTable(result) {
        var str = '';
        var renderList = result.data.findByPage;
        var thisYear = new Date().getFullYear();
        studentsList.splice(0, studentsList.length);
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

        var nextPage = document.getElementById('next-btn');
        var prevPage = document.getElementById('prev-btn');
        if (allPage > nowPage) {
            nextPage.style.display = 'inline-block';
        } else {
            nextPage.style.display = 'none';
        }

        if (nowPage > 1) {
            prevPage.style.display = 'inline-block';
        } else {
            prevPage.style.display = 'none';
        }
    }

    //数据回填
    function backData(data) {
        var editForm = document.getElementById('student-add-form-edit');
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