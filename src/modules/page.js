var pages = {};
module.exports = {
  isExit: function(project, url){
    var temp = pages[project];
    return (temp && temp.indexOf(url) != -1);
  },
  add: function(project, url){
    !pages[project] && (pages[project] = []);
    pages[project].push(url);
  }
};
