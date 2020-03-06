//*************//
// SORT TABLE //
//***********//

tableHead.addEventListener('click',function(e){
    var tableHeader = e.target
        ,cellClass = tableHeader.getAttribute("data-key")
        ,tableHeaderIndex,isAscending,order
    ;
    if (cellClass!=="undefined") {
        while (tableHeader.nodeName!=='TH') {
            tableHeader = tableHeader.parentNode;
        }
        tableHeaderIndex = Array.prototype.indexOf.call(tableHeaders,tableHeader);
        isAscending = tableHeader.getAttribute('data-order')==='asc';
        order = isAscending?'desc':'asc';
        tableHeader.setAttribute('data-order',order);
        tinysort(
            tableBody.querySelectorAll('tr')
            ,{
                selector:'td:nth-child('+(tableHeaderIndex+1)+')'
                ,order: order
            }
        );
    }
});
