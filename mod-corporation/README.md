

```plantuml
'skinparam linetype ortho

component "Agriculture" as agr {
    component "0.5 water" as agrw #green
    component "0.2 chemicals" as agrc #green
    component "1 plant" as agrp #orange
    component "1 food" as agrf #orange
}
agrw --> agrp
agrc --> agrp
agrw --> agrf
agrc --> agrf

component "Tabacco" as tab {
    component "1 plant" as tabp #green
    component "Product" as tabo #red
}
tabp --> tabo

component "Restaurant" as res {
    component "0.5 food" as resf #green
    component "0.5 water" as resw #green
    component "Product" as reso #red
}
resf --> reso
resw --> reso

component "Chemical" as che {
    component "1 plant" as chep #green
    component "0.5 water" as chew #green
    component "1 chemical" as chec #orange
}
chep --> chec
chew --> chec

component "Water Util." as wat {
    component "0.1 hardware" as wath #green
    component "1 water" as watw #orange
}
wath --> watw

component "Pharmaceutical" as pha {
    component "2 chemicals" as phac #green
    component "0.5 water" as phaw #green
    component "1 drug" as phad #orange
    component "Product" as phao #red
}
phac --> phad
phaw --> phad
phac --> phao
phaw --> phao

component "Software" as sof {
    component "0.5 hardware" as sofh #green
    component "1 aiCore" as sofa #orange
    component "Product" as sofo #red
}
sofh --> sofa
sofh --> sofo

component "Refinery" as ref {
    component "1 ore" as refo #green
    component "1 metal" as refm #orange
}
refo --> refm

component "Mining" as min {
    component "0.1 hardware" as minh #green
    component "1 ore" as mino #orange
    component "1 mineral" as minm #orange
}
minh -l-> mino
minh -> minm

component "Computer Hardware" as har {
    component "2 metals" as harm #green
    component "1 hardware" as harh #orange
    component "Product" as haro #red
}
harm --> harh
harm --> haro

component "Real Estate" as rea {
    component "5 metals" as ream #green
    component "1 plant" as reap #green
    component "2 waters" as reaw #green
    component "4 hardwares" as reah #green
    component "1 real estate" as rear #orange
    component "Product" as reao #red
}
ream --> rear
reap --> rear
reaw --> rear
reah --> rear
ream --> reao
reap --> reao
reaw --> reao
reah --> reao

component "Spring Water" as spr {
    component "x water" as sprw #orange
}

component "Fishing" as fis {
    component "0.5 plant" as fisp #green
    component "1 food" as fisf #orange
}
fisp --> fisf

component "Healthcare" as hea {
    component "x robot" as hear #green
    component "x aiCore" as heaa #green
    component "x drug" as head #green
    component "x food" as heaf #green
    component "Product" as heao #red
}
hear --> heao
heaa --> heao
head --> heao
heaf --> heao

component "Robotics" as rob {
    component "x hardware" as robh #green
    component "x aiCores" as roba #green
    component "x robot" as robr #orange
    component "Product" as robo #red
}
robh --> robr
roba --> robr
robh --> robo
roba --> robo



mino -l--> refo #red
refm --> harm #red
refm ---> ream
sofa ---> roba
fisf ---> resf
'agrf ...> resf
agrp ------> tabp
agrp ------> reap
agrp ---> chep #red
harh ---> sofh
harh -u--> minh #red
harh ---> reah
harh ---> wath
harh ---------> robh
watw ---> phaw
watw ---> agrw
watw ---> chew
watw ---> resw
watw ---> reaw
chec ---> phac
chec ---> agrc #red
agrp ---> fisp
fisf ---> heaf
'agrf ...> heaf
phad ---> head
sofa ---> heaa
robr ---> hear 

```