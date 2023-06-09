var Meteorito = {
    property: 10,


    initailize: function(mtlLoader, path){
        return new Promise(resolve => {
            this.mtlLoader = mtlLoader;
            this.axisZ = 0.001;
            this.axisY = 0.005;
            this.axisX = 0.005;
            console.log(path)
            this.mtlLoader.load(path, function(materials) {
            materials.preload();
            this.materials = materials;
            resolve(this.materials);
            })
            
        });
    },

    initializeEvents: function() {
        
    },

    loadFragment: function(objLoader, materials, path) {
            return new Promise(resolve => {
                objLoader.setMaterials(materials);
                objLoader.load(path, function(object) {
                    object.scale.set(1,1,1);
                    object.rotation.x = 180;
                    object.position.set(0,3,0);
                    object;
                    resolve(object); 
                })
                
            });
    },

    PfAutoRotate: function(fragment, count) {
        try {
			fragment.rotation.z += this.axisZ;
			fragment.rotation.y += this.axisY;
			fragment.rotation.x += this.axisX;
			count += 1;
			if (count >= 1000) {
				count = 0;
				changeSpeed();
			}
	    } catch (error) {
            console.log(error);
	    }        
    },

    changeSpeed: function() {
        let condition = Math.floor(Math.random() * 4);
        let jaj;
        switch (condition) {
            case 1:
                jaj = this.axisX;
                this.axisX = this.axisZ;
                this.axisZ = jaj;
                break;
        
            case 2:
                jaj = this.axisY;
                this.axisY = axisZ;
                this.axisZ = jaj;
                break;
                
            case 3:
                this.axisY = 0.005;
                this.axisX = 0.005;
                this.axisZ = 0.001;
                break;
        }
    }
    
};
