// html nodes
var mainTable = document.createElement("table")
    mainTable.classList.add("hidden")
var mainFrame = document.querySelector("main")
var tableHead = document.createElement("thead")
var tableBody = document.createElement("tbody")
var tableHeadRow = document.createElement("tr")
var counter = document.getElementById('counter')
var totalCount = document.getElementById('total-count')
var loadContainer = document.getElementById('load-container')
var loadProgress = document.getElementById('load-progress')
var loadErrors = document.getElementById('load-errors')
var loadMessage = document.getElementById('load-message')
var filter = document.getElementById('filter')
var sort = document.getElementById('sort')
var errors = []
var initHits
var initErrs

// load functions
function increaseCount(){
  let total = userData.schools.length
  let val = parseInt(counter.innerText)
  val++
  counter.innerText = val
  let percent = (val / total * 100)
  loadProgress.style.backgroundImage = `linear-gradient(to right, #5BB65E, #5BB65E ${percent}%, white ${percent}%, white 100%)`
  if(checkSum(val)){
    afterLoad()
  }
}
function checkSum(val){
  if(val + errors.length == userData.schools.length){
    if(errors.length){
      var errMsg = `Achtung: Die Schulen mit den IDs<br><br>[${errors.join('],  [')}]<br><br>konnten nicht geladen werden`
      loadErrors.innerHTML = `<div class="error-message">${errMsg}</div><br>
      <button class="button" style="font-family: 'Lato', sans-serif;" onclick="afterLoad();">OK</button>
      <button class="button" style="font-family: 'Lato', sans-serif; float: right;" onclick="window.location.reload();">Neu Laden</button>`
      return false
    }
    return true
  }
}
// initial reading & loading of IDs
function initCount(type){
  let total = config.topId
  if(type=="success"){
    initHits++
  }
  else if (type=="error") {
    initErrs++
  }
  let both = initHits + initErrs
  let percent = (both / (total-1) * 100)
  loadProgress.style.backgroundImage = `linear-gradient(to right, #5BB65E, #5BB65E ${percent}%, white ${percent}%, white 100%)`
  if(both == (total-1)){
    loadProgress.style.display = "none"
    loadMessage.innerHTML = `Es wurden ${initHits} Sprachschulen gefunden.<br><br>
    <button class="button" onclick="window.location.reload();">Aktualisieren</button>`
  }
}
// when all fetch request are through
function afterLoad(){
  mainTable.classList.remove("hidden")
  loadContainer.classList.add("hidden")
  if(userData.hasOwnProperty("filter")){
    filterTable(userData.filter)
    filter.value = userData.filter
  }
  if(userData.hasOwnProperty("sort")){
    sortTable(userData.sort)
    sort.value = userData.sort
  }
  else {
    document.querySelector('th[data-key="id"]').click()
  }
}
// SORT & FILTER USER SETTINGS & FUNCTIONS
function filterTable(filter){
  if(filter != "none"){
    let split = filter.split(",")
    let key = split[0]
    let value = split[1]
    if(key=="advisor"){
      let advisors = document.querySelectorAll("td[data-key='advisor']")
      for(a=0; a<advisors.length; a++){
        if(advisors[a].innerText == value){
          advisors[a].parentNode.classList.remove("hidden-row")
        }
        else {
          advisors[a].parentNode.classList.add("hidden-row")
        }
      }
    }
    else if(key=="language"){
      let languages = document.querySelectorAll(`span[data-val="${value}"]`)
      let rows = tableBody.querySelectorAll('tr')
      for(r=0; r<rows.length; r++){
        rows[r].classList.add("hidden-row")
      }
      for(l=0; l<languages.length; l++){
        languages[l].parentNode.parentNode.classList.remove("hidden-row")
      }
    }
  }
  else {
    let hiddenRows = mainTable.querySelectorAll(".hidden-row")
    for(hr=0; hr<hiddenRows.length; hr++){
      hiddenRows[hr].classList.remove("hidden-row")
    }
  }
}
function sortTable(key){
  document.querySelector(`th[data-key="${key}"]`).click()
}
function useFilter(node){
  filterTable(node.value)
  userData.filter = node.value
  localStorage.setItem("data", JSON.stringify(userData))
}
function useSort(node){
  sortTable(node.value)
  userData.sort = node.value
  localStorage.setItem("data", JSON.stringify(userData))
}
// SEARCH FUNCTION
function searchNamesAndCities(node){
  // show everything
  removeHiders()
  // get search value
  let search = node.value.toUpperCase()
  // start with names
  let names = mainTable.querySelectorAll("td[data-key='name']")
  for(n=0; n<names.length; n++){
    let text = names[n].innerText.toUpperCase()
    if(!text.includes(search)){
      // hide mismatches
      names[n].parentNode.classList.add("hidden-by-search")
    }
  }
  // after name search is finished start city search
  searchCities(search)
}
// city search
function searchCities(val){
  let cities = mainTable.querySelectorAll("td[data-key='city']")
  for(c=0; c<cities.length; c++){
    let text = cities[c].innerText.toUpperCase()
    if(text.includes(val)){
      // remove previously set hider from matches
      cities[c].parentNode.classList.remove("hidden-by-search")
    }
  }
}
// show all rows previously hidden by search
function removeHiders(){
  let searchHides = mainTable.querySelectorAll(".hidden-by-search")
  for(s=0; s<searchHides.length; s++){
    searchHides[s].classList.remove("hidden-by-search")
  }
}

// db data
var userData = JSON.parse(localStorage.getItem('data'))
if(userData === null){
  userData = {}
  userData.schools = []
}

// config data
// var config >>> is loaded in index.html via script source
var dataMap = config.dataMap

// set fetch headers
var fetchOptions = {
  method: 'get',
  headers: {
    "Content-Type": "text/plain"
  }
}

// initialize db
if(userData.schools.length <= 0){
  let filler = ""
  if(config.hasOwnProperty("topId")){
    filler = ` mit IDs bis ${config.topId}`
  }
  loadMessage.innerText = `Schulen${filler} werden überprüft`
  update()
}

// initialize / update school ids
function update(){
  if(config.hasOwnProperty("topId")){
    initHits = 0;
    initErrs = 0;
    for(i=1; i<config.topId; i++){
      fetch(`https://api.sww.curry-software.de/api/school/${i}`, fetchOptions)
        .then(response => response.json())
        .then(data =>{
          initCount("success")
          if(data.deployed){
            let id = data.id
            // check if id already exists in school array
            let probe = userData.schools.includes(id)
            if(!probe){
              // if not push id into schools array
              userData.schools.push(id)
              localStorage.setItem('data', JSON.stringify(userData))
            }
          }
        })
        .catch(err => {
          initCount("error")
          //console.error(err)
        })
    }
    // then check if there are obsolte school entries
    // checkObsolete() --> LATER!
  }
  else {
    alert("Error: Keine Obergrenze gesetzt!")
  }
}

function updateSchools(){
  let check = confirm(`Dies löscht alle gespeicherten Schulen und stellt eine neue Anfrage an die\nDatenbank welche Schulen aktiv sind.\n\nBenutzereinstellungen bleiben erhalten.\n\nFortfahren?\n\n`);
  if(check){
    userData.schools = []
    localStorage.setItem("data", JSON.stringify(userData))
    window.location.reload()
  }
}

// MAKE OUTPUT

if(userData.schools.length > 0){
  totalCount.innerText = userData.schools.length
  startTable(userData.schools)
}

function startTable(array){
  makeTableHeader(dataMap)
  mainTable.border = 1
  mainTable.appendChild(tableHead)
  mainTable.appendChild(tableBody)
  // get data for each school
  for(a=0; a<array.length; a++){
    let id = array[a]*1
    getData(id)
  }
  mainFrame.appendChild(mainTable)
}

function makeTableHeader(map){
  for(m=0; m<map.length; m++){
    let th = document.createElement("th")
    th.innerText = map[m][2]
    th.setAttribute("data-key", map[m][1])
    tableHeadRow.appendChild(th)
  }
  tableHead.appendChild(tableHeadRow)
}

// MAIN API CALL
function getData(id){
  fetch(`https://api.sww.curry-software.de/api/school/${id}`, fetchOptions)
    .then(response => response.json())
    .then(data =>{
      if(data.deployed){
        increaseCount()
        filterData(data)
      }
    })
    .catch(err => {
      errors.push(id)
      //console.error(err)
    })
}

// FILTER DATA USING DATA MAP IN CONFIG FILE
function filterData(data){
  let set = {}
  for(d=0; d<dataMap.length; d++){
    // special handling
    if(dataMap[d][0] == "languages"){
      set[dataMap[d][1]] = data[dataMap[d][0]][0]
    }
    else if(dataMap[d][0] == "courses"){
      let courseArray = []
      let courses = data[dataMap[d][0]]
      for(c=0; c<courses.length; c++){
        let course = courses[c]
        if(course.active){
          let filteredCourse = {}
          filteredCourse.name = course.name
          filteredCourse.id = course.id
          filteredCourse.info = course.coursepage_info
          courseArray.push(filteredCourse)
        }
      }
      set[dataMap[d][1]] = courseArray
    }
    // generic handling
    else{
      set[dataMap[d][1]] = data[dataMap[d][0]]
    }
  }
  makeTableRow(set)
}

// PUT ALL INFO IN MAIN TABLE
function makeTableRow(school){
  let schoolRow = document.createElement("tr")
  schoolRow.setAttribute("data-id", school.id)
  for(key in school){
    let val = school[key]
    let cell = document.createElement("td")
    cell.setAttribute("data-key", key)
    let rendered = renderKey(dataMap, key, val)
    if(typeof(rendered)==="object"){
      cell.appendChild(rendered)
    }
    else{
      cell.innerHTML = rendered
    }
    schoolRow.appendChild(cell)
  }
  tableBody.appendChild(schoolRow)
  //decreaseCount()
}

// SORTING

var tableHeaders = mainTable.querySelectorAll('th')
for(t=0; t<tableHeaders.length; t++){
  tableHeaders[t].onclick = function(){
    resetSiblings(this)
    styleActiveColum(this)
  }
}

function resetSiblings(el){
  let siblings = getSiblings(el)
  for(s=0; s<siblings.length; s++){
    siblings[s].removeAttribute("data-order")
  }
}

function getSiblings(elem) {
	var siblings = []
	var sibling = elem.parentNode.firstChild
	while (sibling) {
		if (sibling.nodeType === 1 && sibling !== elem) {
			siblings.push(sibling)
		}
		sibling = sibling.nextSibling
	}
	return siblings
}

function styleActiveColum(el){
  let key = el.getAttribute("data-key")
  let tds = mainTable.querySelectorAll("td")
  for(t=0; t<tds.length; t++){
    tds[t].classList.remove("active-column")
    if(tds[t].getAttribute("data-key") == key){
      tds[t].classList.add("active-column")
    }
  }
}
