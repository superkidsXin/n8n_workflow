import ResourceBuilder from './ResourceBuilder';
declare class ResourceFactory {
    static build(basedir: string): ResourceBuilder;
}
export default ResourceFactory;
