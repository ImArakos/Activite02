const Repository = require('../models/Repository');
const utilities = require('../utilities');

module.exports = 
class BookmarksController extends require('./Controller') {
    constructor(req, res){
        super(req, res);
        this.bookmarksRepository = new Repository('Bookmarks');
    }
    // GET: api/bookmarks
    // GET: api/bookmarks/{id}
    help() {
        // expose all the possible query strings
        let content = "<div style=font-family:arial>";
        content += "<h3>GET: 	    /api/bookmarks				    voir tous les bookmarks</h3><hr>";
        content += "<h3>GET: 	    /api/bookmarks?sort=name		voir tous les bookmarks triés ascendant par Name</h3><hr>";
        content += "<h3>GET: 	    /api/bookmarks?sort=category	voir tous les bookmarks triés descendant par Category</h3><hr>";
        content += "<h3>GET: 	    /api/bookmarks/id			    voir le bookmark Id</h3><hr>";
        content += "<h3>GET: 	    /api/bookmark?name=nom		    voir le bookmark avec Name = nom</h3><hr>";
        content += "<h3>GET:        /api/bookmark?name=ab* 		    voir tous les bookmarks avec Name commençant par ab</h3><hr>";
        content += "<h3>GET: 	    /api/bookmark?category=sport	voir tous les bookmarks avec Category = sport</h3><hr>";
        content += "<h3>GET: 	    /api/bookmark?				    Voir la liste des paramètres supportés</h3><hr>";
        content += "<h3>POST: 	    /api/bookmarks				    Ajout d’un bookmark (validez avant d’ajouter)</h3><hr>";
        content += "<h3>PUT: 	    /api/bookmarks/Id			    Modifier le bookmark Id (validez avant de modifier)</h3><hr>";
        content += "<h3>DELETE:     /api/bookmarks/Id			    Effacer le bookmark Id</h3><hr>";
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(content) + "</div>";
    }

    get(id){
        let parsed = this.getQueryStringParams();
        let bookmarksArray = [];
        bookmarksArray = this.bookmarksRepository.getAll();

        if(!isNaN(id))
            this.response.JSON(this.bookmarksRepository.get(id));
        else{
            if(parsed != null){
                if (Object.keys(parsed).length === 0) {
                    this.help();
                    return null;
                }
                else{
                    if("sort" in parsed){
                        var sort = parsed.sort;
                        var complete = false
                        sort = utilities.capitalizeFirstLetter(sort);
                        /*while(!complete){
                            complete = true;
                            for(i = 0; i < bookmarksArray.length - 1; i++){
                                if(bookmarksArray[i].sort > bookmarksArray[i + 1].sort){
                                    complete = false
                                    var temp = bookmarksArray[i];
                                    bookmarksArray[i] = bookmarksArray[i + 1];
                                    bookmarksArray[i + 1] = temp;
                                }
                            }
                        }*/
                        bookmarksArray.sort(valueToCompare(sort));
                    }
                    if("name" in parsed){
                        var name = parsed.name;
                        var array = [];
                        var regex = "^";
                        for (var i = 0; i < name.length; i++){
                            array.push(name.charAt(i).toLowerCase());
                        }
                        array.forEach(element => {
                            switch(element){
                                case '*':
                                    regex += '.*';
                                    break;
                                default:
                                    regex += element;
                            }
                        });
                        regex += '$'
                        var toCheck = new RegExp(regex);
                        var bookmarks = [];
                        for (var i = 0; i < bookmarksArray.length; i++){
                            if (bookmarksArray[i].Name.toLowerCase().match(toCheck)){
                                bookmarks.push(bookmarksArray[i])
                            }
                        }
                        bookmarksArray = bookmarks;
                    }
                    if("category" in parsed){
                        var category = parsed.category;
                        var array = [];
                        var regex = "^";
                        for (var i = 0; i < category.length; i++){
                            array.push(category.charAt(i).toLowerCase());
                        }
                        array.forEach(element => {
                            switch(element){
                                case '*':
                                    regex += '.*';
                                    break;
                                default:
                                    regex += element;
                            }
                        });
                        regex += '$'
                        var toCheck = new RegExp(regex);
                        var bookmarks = [];
                        for (var i = 0; i < bookmarksArray.length; i++){
                            if (bookmarksArray[i].Category.toLowerCase().match(toCheck)){
                                bookmarks.push(bookmarksArray[i])
                            }
                        }
                        bookmarksArray = bookmarks;
                    }
                }
            }
            this.response.JSON(bookmarksArray);
        }
        
    }
            
    // POST: api/bookmarks body payload[{"Id": 0, "Name": "...", "Url": "...", "Category": "..."}]
    post(bookmark){  
        // todo : validate contact before insertion
        // todo : avoid duplicates
        let newBookmark = this.bookmarksRepository.add(bookmark);
        if (newBookmark)
            this.response.created(JnewBookmark);
        else
            this.response.internalError();
    }
    // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "..."}]
    put(bookmark){
        // todo : validate contact before updating
        if (this.bookmarksRepository.update(bookmark))
            this.response.ok();
        else 
            this.response.notFound();
    }
    // DELETE: api/bookmarks/{id}
    remove(id){
        if (this.bookmarksRepository.remove(id))
            this.response.accepted();
        else
            this.response.notFound();
    }
}

function valueToCompare(elemToSort) {
    return function (a, b) {
        if (!a.hasOwnProperty(elemToSort) || !b.hasOwnProperty(elemToSort)) {
            return 0;
        }
        var A = a[elemToSort].toString().toLowerCase();
        var B = b[elemToSort].toString().toLowerCase();
        var result;

        if (A > B)
            result = 1;
        else if (A < B)
            result = -1;
        else
            result = 0;

        return result;
    };
}