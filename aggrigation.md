1. aggrition- is used for  process to  filter , join , transform ,group and calculating data .

 2.param- is used to get the value of url 
 ex-http/:id : id =10

3.difference between the req.body , req,query ,req.param

// req.param- it is used to get the user value . // http/user/100
// req.body-request for body // {username:siddhant}
// req.query -url query string //users?age=20

1. $match - it can be check the condition like price can be grater then 400($gt).
2. $sort - it can arrange to ascending order and decending order .
3. $lookup- it is used to connect two collection .
example - 
book - {
  _id:1
  title:krish is one army 
  author:100
}
author-{
  _id:100
  author name :"siddhant"

}
// code - db.book.aggregate([
  {
    $lookup:{
      from:"author",
      localField:"authorid",
      forignfield:"_id",
      as:authordetail
    }
  }
])
// o/p-{
  _id: 1,
  title: "Book Leader",
  author_id: 100,
  authorDetails: [
    {
      _id: 100,
      name: "Krish"
    }
  ]
}

// group - it can used to combine the document in the same field 
{
  title: "Book A",
  author_id: 100,
  price: 500
}
{
  title: "Book B",
  author_id: 100,
  price: 700
}
{
  title: "Book C",
  author_id: 101,
  price: 300
}
db.book.aggregate([
  $group:{
    _id:"author_id"
    totalbook:{
      $sum:1
    }
  }
])
// o/p-id: 100,
  totalBooks: 2
}
{
  _id: 101,
  totalBooks: 1
}

// sum - it is used total count of the value .

// project-it is used to control the data which are you want to them .

6.$limit- it can be used to controlled the limit of the project .

