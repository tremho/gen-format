
import {FileOps} from "./Formatter";

export let nfs:any = null
try {
    if (typeof global === 'object') {
        if (typeof global.process === 'object') {
            // node detected
            nfs.fs = require('fs')
            nfs.path = require('path')
        }
    }
} catch(e) {

}

const i18nPath = nfs ? nfs?.path.join(__dirname, '..', '..', './i18n/') : './i18n/'
let displayed = false
class NodeFileOps implements FileOps {
    read(realPath:string): string {
        if(!nfs) return ''
        let contents = nfs?.fs.readFileSync(realPath).toString() ?? ''
        return contents
    }
    enumerate(dirPath:string, callback:any) {
        if(!nfs) return;
        let apath = nfs?.path.resolve(nfs?.path.normalize(nfs?.path.join(dirPath)))
        if(!nfs?.fs.existsSync(apath)) return;
        let entries = nfs?.fs.readdirSync(apath)
        entries.forEach(file => {
            let pn = nfs?.path.join(dirPath, file)
            let state = nfs?.fs.lstatSync(pn)
            if(state.isDirectory()) {
                this.enumerate(nfs?.path.join(dirPath, file), callback)
            } else {
                callback(pn)
            }
        })
    }
    get i18nPath() {
        // if(!displayed) {
        //     console.log('rootPath = ' + path.resolve(i18nPath))
        //     displayed = true
        // }
        return i18nPath
    }
}
export default new NodeFileOps()