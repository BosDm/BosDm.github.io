function ObjToArray(obj) {
    var arr = [];
    for(var prop in obj){
        if(obj.hasOwnProperty(prop)){
            var _obj = obj[prop];
            _obj._id = prop;
            arr.push(_obj)
        }
    }
    return arr;
}

const config = {
    apiKey: "AIzaSyAMptvnBM_UQnkQFLJI_iHZ4Yot4u56kvc",
    authDomain: "library-5364c.firebaseapp.com",
    databaseURL: "https://library-5364c.firebaseio.com",
    storageBucket: "",
    messagingSenderId: "461560343771"
};

firebase.initializeApp(config);

var books = [],
    libraryDB = firebase.database().ref();

var Header = React.createClass({
    onAddBtnClick: function(e) {
        ReactDOM.render(
            <AddBook />,
            document.getElementById('modalEditBook')
        );
    },
    render: function(){
        return(
            <div className="top">
                <div className="row header">
                    <div className="col-md-3 text-right text-primary">
                        <h3>Library of my books</h3>
                    </div>
                    <div className="col-md-2 text-left">
                        <button
                            id="add_book"
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={this.onAddBtnClick}
                            >
                            <span className="glyphicon glyphicon-plus"/>
                            Add new book
                        </button>
                    </div>
                </div>
            </div>
        );
    }
});

var Book = React.createClass({
    propTypes: {
        book_id: React.PropTypes.string.isRequired,
        data: React.PropTypes.shape({
            title: React.PropTypes.string.isRequired,
            author: React.PropTypes.string.isRequired,
            year: React.PropTypes.number.isRequired
        })
    },
    onEditBtnClick: function(e) {
        ReactDOM.render(
            <EditBook book={this.props.book_id} data={this.props.data}/>,
            document.getElementById('modalEditBook')
        );
    },
    onRemoveBtnClick: function(e) {
        ReactDOM.render(
            <RemoveBook book={this.props.book_id}/>,
            document.getElementById('modalRemoveBook')
        );
    },
    render: function(){
        var book = this.props.data;
        return (
            <div className="book row">
                <div className="col-md-5 text-left">
                    <p className='book__title'>{book.title}</p>
                </div>
                <div className="col-md-3">
                    <p className='book__author'>{book.author}</p>
                </div>
                <div className="col-md-1">
                    <p className='book__year'>{book.year}</p>
                </div>
                <div className="col-md-3">
                    <div
                        className="book__edit book__action"
                        title="edit book"
                        onClick={this.onEditBtnClick}
                        >
                        <span className="glyphicon glyphicon-edit text-primary" />
                    </div>
                    <div
                        className="book__remove book__action"
                        title="remove book"
                        onClick={this.onRemoveBtnClick}
                        >
                        <span className="glyphicon glyphicon-remove text-danger"/>
                    </div>
                </div>
            </div>
        );
    }
});

var Books = React.createClass({
    propTypes: {
        data: React.PropTypes.array.isRequired
    },
    getInitialState: function() {
        return {
            sortField: null,
            sortDesc: true
        };
    },
    sortBook: function() {
        var field = this.state.sortField;
        this.props.data.sort(function(a,b){
            var c,d,e,f;
            if(this.state.sortDesc){
                c = a;
                d = b;
            }else{
                c = b;
                d = a;
            }
            e = c[''+field];
            f = d[''+field];
            if(field != 'year') {
                c = e.toLowerCase();
                d = f.toLowerCase();
            }

            if(c > d){
                return 1;
            }else{
                return -1;
            }
        }.bind(this));
    },
    onTitleClick: function(element) {
        var value;
        if(this.state.sortField != element){
            return this.setState({sortField: element});
        }
        value = !this.state.sortDesc;
        this.setState({sortDesc: value});

    },
    getArrow: function(element) {
        var html;
        var arrow_up = <span className="glyphicon glyphicon-arrow-up" />;
        var arrow_down = <span className="glyphicon glyphicon-arrow-down" />;
        if(this.state.sortField == element){
            if(this.state.sortDesc){
                html = arrow_up;
            }else {
                html = arrow_down;
            }
        }else {
            html = '';
        }
        return html;
    },
    render: function() {
        var books,booksTemplate = [];

        if(this.state.sortField) this.sortBook();
        books = this.props.data;

        if(books.length > 0) {
            booksTemplate = books.map(function(item) {
                return(
                    <div key={item._id} className="book">
                        <Book book_id={item._id} data={item}/>
                    </div>
                );
            });
        } else {
            booksTemplate = <p>Sorry, but Library is empty</p>
        }

        return (
            <div className="books text-center">
                <div className="row books__caption">
                    <div className="col-md-5" onClick={this.onTitleClick.bind(this, 'title')}>
                        <h4>
                            Title
                            {this.getArrow('title')}
                        </h4>
                    </div>
                    <div className="col-md-3" onClick={this.onTitleClick.bind(this, 'author')}>
                        <h4>
                            Author
                            {this.getArrow('author')}
                        </h4>
                    </div>
                    <div className="col-md-1" onClick={this.onTitleClick.bind(this, 'year')}>
                        <h4>
                            Year
                            {this.getArrow('year')}
                        </h4>
                    </div>
                    <div className="col-md-3">
                        <h4>Actions</h4>
                    </div>
                </div>
                <div className="books__body">
                    {booksTemplate}
                </div>
                <strong
                    className={'news__count ' + (books.length > 0 ? '':'none') }>
                    Books count: {books.length}
                </strong>
            </div>
        );
    }
});

var EditBook = React.createClass({
    propTypes: {
        book:React.PropTypes.string.isRequired,
        data: React.PropTypes.shape({
            title: React.PropTypes.string.isRequired,
            author: React.PropTypes.string.isRequired,
            year: React.PropTypes.number.isRequired
        })
    },
    getInitialState: function() {
        return {
            showModal: true,
            titleIsEmpty: false,
            authorIsEmpty: false,
            yearIsEmpty: false
        };
    },
    onFieldChange: function(fieldName, e) {
        if (e.target.value.trim().length > 0) {
            this.setState({[''+fieldName]:false})
        } else {
            this.setState({[''+fieldName]:true})
        }
    },
    onUpdateBtnClick: function(e) {
        var new_book = {};
        var year = parseInt(ReactDOM.findDOMNode(this.refs.year).value);
        if(year) {
            new_book.title = ReactDOM.findDOMNode(this.refs.title).value;
            new_book.author = ReactDOM.findDOMNode(this.refs.author).value;
            new_book.year = parseInt(ReactDOM.findDOMNode(this.refs.year).value);
            var new_book_key = hex_md5(JSON.stringify(new_book));
            if (new_book_key == this.props.book) {
                this.onClose();
            } else {
                libraryDB.child(new_book_key).set(new_book, function (error) {
                    if (error) {
                        alert("Data could not be saved." + error);
                    } else {
                        libraryDB.child(this.props.book).remove(function (error) {
                            if (error) {
                                alert("Data could not be saved." + error);
                            } else {
                                this.onClose();
                                Library.prototype.getBooks();
                            }
                        }.bind(this));

                    }
                }.bind(this));
            }
        }else{
            alert('Year field have to contains just numbers');
        }
    },
    onClose: function() {
        this.setState({ showModal: false });
    },
    componentDidUpdate: function() {
        if(!this.state.showModal) {
            ReactDOM.render(
                <div />,
                document.getElementById('modalEditBook')
            );
        }
    },
    render: function() {
        var book = this.props.data,
            state = this.state,
            Modal = ReactBootstrap.Modal;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.onClose}>
                    <Modal.Header bsClass="modal-header bg-primary">
                            <Modal.Title>Edit "{book.title}"</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Book title:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__title form-control'
                                    onChange={this.onFieldChange.bind(this, 'titleIsEmpty')}
                                    defaultValue={book.title}
                                    ref='title'
                                    />
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Author's name:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__author form-control'
                                    onChange={this.onFieldChange.bind(this, 'authorIsEmpty')}
                                    defaultValue={book.author}
                                    ref='author'
                                    />
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Year of publishing:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__year form-control'
                                    onChange={this.onFieldChange.bind(this, 'yearIsEmpty')}
                                    defaultValue={book.year}
                                    ref='year'
                                    />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            onClick={this.onUpdateBtnClick}
                            type="button"
                            className="btn btn-primary btn-sm"
                            disabled={
                                state.titleIsEmpty ||
                                state.authorIsEmpty ||
                                state.yearIsEmpty
                            }
                            >
                            Update
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );


    }
});

var AddBook = React.createClass({
    getInitialState: function() {
        return {
            showModal: true,
            titleIsEmpty: true,
            authorIsEmpty: true,
            yearIsEmpty: true
        };
    },
    onFieldChange: function(fieldName, e) {
        if (e.target.value.trim().length > 0) {
            this.setState({[''+fieldName]:false})
        } else {
            this.setState({[''+fieldName]:true})
        }
    },
    onClose: function() {
        this.setState({ showModal: false });
    },
    componentDidUpdate: function() {
        if(!this.state.showModal) {
            ReactDOM.render(
                <div />,
                document.getElementById('modalEditBook')
            );
        }
    },
    onAddBtnClick: function() {
        var year = parseInt(ReactDOM.findDOMNode(this.refs.year).value);
        var book = {};
        if(year) {
            book.title = ReactDOM.findDOMNode(this.refs.title).value;
            book.author = ReactDOM.findDOMNode(this.refs.author).value;
            book.year = year;

            var book_key = hex_md5(JSON.stringify(book));
            libraryDB.child(book_key).set(book, function (error) {
                if (error) {
                    alert("Data could not be saved." + error);
                } else {
                    this.onClose();
                    Library.prototype.getBooks();
                }
            }.bind(this));
        }else{
            alert('Year field have to contains just numbers');
        }
    },
    render: function() {
        var state = this.state,
            Modal = ReactBootstrap.Modal;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.onClose}>
                    <Modal.Header>
                        <Modal.Title>Add book</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Book title:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__title form-control'
                                    onChange={this.onFieldChange.bind(this, 'titleIsEmpty')}
                                    defaultValue=''
                                    ref='title'
                                    />
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Author's name:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__author form-control'
                                    onChange={this.onFieldChange.bind(this, 'authorIsEmpty')}
                                    defaultValue=''
                                    ref='author'
                                    />
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col-md-6 text-right">
                                <span>Year of publishing:</span>
                            </div>
                            <div className="col-md-6">
                                <input
                                    type='text'
                                    className='edit__year form-control'
                                    onChange={this.onFieldChange.bind(this, 'yearIsEmpty')}
                                    defaultValue=''
                                    ref='year'
                                    />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            onClick={this.onAddBtnClick}
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={
                                state.titleIsEmpty ||
                                state.authorIsEmpty ||
                                state.yearIsEmpty
                            }
                            >
                            Add
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

var RemoveBook = React.createClass({
    propTypes: {
        book: React.PropTypes.string.isRequired
    },
    getInitialState: function() {
        return {
            showModal: true
        };
    },
    onClose: function() {
        this.setState({ showModal: false });
    },
    componentDidUpdate: function() {
        if(!this.state.showModal) {
            ReactDOM.render(
                <div />,
                document.getElementById('modalRemoveBook')
            );
        }
    },
    onRemoveBookHandle: function() {
        libraryDB.child(this.props.book).remove(function(error) {
            if (error) {
                alert('Synchronization failed');
            } else {
                this.onClose();
                Library.prototype.getBooks();
            }
        }.bind(this));
    },
    render: function() {
        var Modal = ReactBootstrap.Modal;
        return (
            <div>
                <Modal show={this.state.showModal} onHide={this.onClose}>
                    <Modal.Header>
                        <Modal.Title>Remove book</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                       <p>Do you really want to remove a book?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={this.onRemoveBookHandle}
                            >
                            Yes
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={this.onClose}
                            >
                            No
                        </button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
});

var Library = React.createClass({
    getInitialState: function() {
        return {
            update: true
        };
    },
    getBooks: function() {
        libraryDB.once("value", function(data) {
            books = ObjToArray(data.val());

            ReactDOM.render(
                <Library />,
                document.getElementById('root')
            );
        });
    },
    update: function(){
        this.setState();
    },
    render: function() {
        return (
            <div className="library">
                <Header />
                <Books callUpdate={this.update} data={books}/>
                <div id="modalAddBook"/>
                <div id="modalEditBook"/>
                <div id="modalRemoveBook"/>
            </div>
        );
    }
});

Library.prototype.getBooks();