var x = document.getElementsByClassName("button");
for (var i = 0; i < x.length; i++) {
  x[i].style.backgroundColor = "lightgray"; // Изменяем цвет фона
  x[i].style.pointerEvents = "none"; // Запрещаем нажатия
}
