//***************//
// DATA MAPPING //
//************//

function normalizeUrl(input, options){
  var modified = input
  if(options.stripProtocol){
    if(input.includes("https://")){
      modified = input.split("https://")[1]
    }
    else if(input.includes("https://")){
      modified = input.split("http://")[1]
    }
    if(modified.includes("www.")){
      modified = modified.split("www.")[1]
    }
  }
  else if(options.forceHttps){
    if(!input.includes("https://")){
      if(input.includes("http://")){
        modified = 'https://' + input.split("http://")[1]
      }
      else {
        modified = 'https://' + input
      }
    }
  }
  return modified
}

function getDomain(url){
  let href = url
  if(!url.includes('http')){
    href = `https://${url}`
  }
  let a = document.createElement("a")
      a.href = href
  return a.hostname
}

// RENDER KEY

function renderKey(map, key, val){
  let output = ""
  // ID
  if(key == "id"){
    output = `<a href="https://sww.curry-software.de/#/school/${val}" target="_blank">${val}</a>`
  }
  // URL
  else if(key == "url"){
    let show = normalizeUrl(val, {stripProtocol: true})
    if(show.indexOf("index.html") > -1){
      show = show.split("index.html")[0]
      show = normalizeUrl(show, {stripProtocol: true})
    }
    output = `<a title="${normalizeUrl(val, {forceHttps: true})}" href="${normalizeUrl(val, {forceHttps: true})}" target="_blank">${show}</a>`
  }
  // PRICES & AGB LINKS
  else if(key == "priceListUrl" || key == "agb"){
    let base = getDomain(val)
    let split = val.split(base)[1]
    output = `<a title="${normalizeUrl(val, {forceHttps: true})}" href="${normalizeUrl(val, {forceHttps: true})}" target="_blank"><span class="inline-icon">${feather.icons.home.toSvg()}</span>${split}</a>`
  }
  // ADVISORS
  else if(key == "advisor"){
    let name = val
    if(config.hasOwnProperty("conversionMap") && config.conversionMap.hasOwnProperty("advisors")){
      name = mapPair(config.conversionMap.advisors, val)
    }
    output = name
  }
  // LANGUAGE & LAND
  else if(key == "language" || key == "country"){
    let container = document.createElement("span")
    container.setAttribute("data-val", val)
    let flagContainer = document.createElement("span")
    container.innerHTML = `<span class="hidden-flag-code">${val}</span>`
    let flagCode = val
    if(flagCode == "el"){
      flagCode = "gr"
      container.innerHTML = `<span class="hidden-flag-code">gr</span>`
      container.setAttribute("data-val", "gr")
    }
    else if (flagCode == "en"){
      flagCode = "gb"
    }
    else if(flagCode == "zh"){
      flagCode = "cn"
    }
    let flag = new CountryFlag(flagContainer)
    flag.selectByAlpha2(flagCode)
    container.appendChild(flagContainer)
    output = container
  }
  // CITY
  else if(key == "city"){
    // the actual db key is address -> extract city value
    output = val.city
  }
  // COURSES
  else if(key == "courses"){
    output = ""
    output = makeCircularProgress(val, key);
  }
  // NO SPECIAL HANDLING
  else {
    output = val
  }
  return output
}

// MAP PAIR
function mapPair(map, input){
  let output = ""
  for(m=0; m<map.length; m++){
    if(map[m][0] == input){
      output = map[m][1]
    }
  }
  return output
}

// CIRCULAR PROGRESS
function makeCircularProgress(val, key){
  let percent = 0
  let color = "#111"
  let total = val.length
  if(!total > 0){
    return `<a data-key="${key}">Keine<br>Kurse</a>`
  }
  let count = 0
  for(v=0; v<val.length; v++){
    let course = val[v]
    let info = course.info.trim()
    if(info.length > 0){
      count++
    }
  }
  percent = (count / total * 100)
  percent = Number((percent).toFixed(0))
  if(percent >= 0 && percent <= 25){
    color = "red"
  }
  else if(percent > 25 && percent <= 50){
    color = "yellow"
  }
  else if(percent > 50 && percent <= 75){
    color = "blue"
  }
  else if(percent > 75 && percent < 100){
    color = "turquoise"
  }
  else if(percent == 100){
    color = "green"
  }
  let a = document.createElement("a")
  a.setAttribute("data-key", key)
  let progress = document.createElement("div")
  progress.classList.add("c100", `p${percent}`, "small", color)
  progress.innerHTML = `<span>${percent}%</span><div class="slice">
    <div class="bar"></div>
    <div class="fill"></div>
  </div>`
  a.addEventListener("click", function(){
    console.log(val);
  })
  a.appendChild(progress)
  return a
}
