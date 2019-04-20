# AutoComplete
검색한 데이터를 자동으로 표현해주는 Component

Usage
-------------
```
var auto = new Autocomplete('selector',opt);
```

Property
-------------

| property | type | desc |
|:--------|:--------:|:--------|
| datas | Array | 자동완성 데이터 리스트 |
| ajax | Function(term:String, callback:Function) | Ajax 통신을 데이터 검색 데이터 조회 후, callback 함수를 수행하여 Autocomponent 수행 |
| selectFirst | Boolean | 첫 아이템 선택 여부 |
| renderItem | Function(data:Object) | datas or ajax 통해 가져온 데이터를 가공하기 위한 메소드 제공 |
