const path = require('path');
const fs = require('fs');

const getAbsolutePath = (file='app.html', asarUnpack=false) => {
    try {
        console.log(file)
        const cwd = process.cwd();
        const cwdElectronReact = path.join(cwd, 'app');
        const resourcesPath = process.resourcesPath;
        console.log(`cwd:${cwd}, resourcesPath:${resourcesPath}`);
        const cwdBased = path.resolve(path.join(cwd, file));
        const cwdElectronReactBased = path.resolve(path.join(cwdElectronReact, file));
        const asarPath = asarUnpack ? 'app.asar.unpacked' : 'app.asar';
        const resourcesBased = path.resolve(path.join(resourcesPath, asarPath, file));
    
        if(fs.existsSync(cwdBased)){
            console.log('run in Nornal Electron CLI')
            return cwdBased;
        } else if(fs.existsSync(cwdElectronReact)){
            console.log('run in Electron React Create App CLI');
            return cwdElectronReactBased;
        } else if(fs.existsSync(resourcesBased)){
            console.log('run in packaged Electron App');
            return resourcesBased;
        } else {
            console.log(`file not exists : ${file}`);
            return false;
        }
    } catch (error) {
        console.error(error)
    }

}

const readJSONFile = jsonFile => {
    try {
        const obj = JSON.parse(fs.readFileSync(jsonFile));
        return obj;
    } catch(err) {
        throw new Error(err);
    }
}

const getFromJsonFile = (options) => {
    const {
        defaultJsonFile,
        customJsonFile,
        asarUnpack=true,
        selectFunction = (defaultArray, customArray) => {
            //todo : need process when defalus is not array but object
            return customArray.length === 0 ? defaultArray : customArray;
        }
    } = options;
    let json = {};
    try {
        const defaultJson= getAbsolutePath(defaultJsonFile, asarUnpack);
        const customJson= getAbsolutePath(customJsonFile, asarUnpack);
        const defaultValue = readJSONFile(defaultJson);
        const customValue = readJSONFile(customJson);
        json = selectFunction(defaultValue, customValue);
    } catch (error) {
        console.error(error)
    }
    return json;
}

module.exports = {
    getAbsolutePath,
    readJSONFile,
    getFromJsonFile
}
