import {
    Asset,
    AssetManager,
    assetManager,
    AudioClip,
    BitmapFont,
    BufferAsset,
    Constructor,
    ImageAsset,
    JsonAsset,
    sp,
    SpriteAtlas,
    SpriteFrame,
    TextAsset,
    Texture2D
} from "cc";
import { be } from "../be";
import { scheduler } from "../scheduler";
import { singletons } from "../singleton";
import { app } from "./app";

export namespace res {
    class BundleLoader {
        private _assets: Map<string, Asset>;

        constructor( public readonly bundle: AssetManager.Bundle ) {
            this._assets = new Map();
        }

        public load<T extends Asset>(
            path: string,
            type: Constructor<T>
        ): Promise<T | null> {
            return new Promise<T | null>( ( resolve ) => {
                if ( this._assets.has( path ) ) {
                    return resolve( this._assets.get( path ) as T );
                }

                this.load_sync(
                    path,
                    type,
                    function ( data ) { resolve( data ); },
                    null,
                    function () { resolve( null );}
                );
            } );
        }

        public load_sync<T extends Asset>(
            path: string, type: Constructor<T>,
            oncomplete: ( ( data: T ) => void ) | null,
            onprogress: ( ( cur: number, total: number ) => void ) | null,
            onerror: ( ( err: any ) => void ) | null ) {
            const that = this;
            this.bundle.load(
                path,
                type,
                function ( c, t ) {
                    onprogress && onprogress( c, t );
                },
                function ( err, data ) {
                    if ( err ) {
                        onerror && onerror( err );
                    } else {
                        data.addRef();
                        that._assets.set( path, data );
                        oncomplete && oncomplete( data );
                    }
                }
            );
        }

        public load_many_async(
            paths: [ string, Constructor<Asset> ][] ) {
            const promises = [];
            for ( let i = 0, l = paths.length; i < l; i++ ) {
                let [ path, type ] = paths[i];
                promises.push( this.load( path, type ) );
            }
            return Promise.all( promises );
        }

        public load_many( paths: [ string, Constructor<Asset> ][],
                          oncomplete: ( ( assets: Asset[] ) => void ) | null,
                          onprogress: ( ( cur: number, total: number ) => void ) | null,
                          onerror: ( ( err: any ) => void ) | null ) {
            const that = this;
            let count = paths.length;
            let errors: string[] = [];
            let assets: Asset[] = [];
            for ( let i = 0; i < count; i++ ) {
                let [ path, type ] = paths[i];
                scheduler.next_frame( this, function () {
                    that.load_sync( path, type, function ( data ) {
                        assets.push( data );
                        if ( oncomplete && i == count - 1 ) oncomplete( assets );
                    }, function () {
                        onprogress && onprogress( i, count );
                    }, function () {
                        errors.push( path );
                        if ( onerror && i == count - 1 ) onerror( errors );
                    } );
                } );
            }
        }
    }

    class RemoteLoader {
        private _assets: Map<string, Asset>;
        private _manifest: Record<string, string>;

        constructor() {
            this._assets = new Map();
            this._manifest = {};
        }

        /**
         * 加载远程资源
         * @param abbr 路径缩写
         * @param category 远程资源类型
         * @param type 目标资源类型
         */
        public load( abbr: string, category: RemoteCategory, options?: Partial<{
            image: "png" | "jpg";
            spine: "json" | "ske";
            [key: string]: string
        }> ): Promise<Asset | null> {
            switch ( category ) {
                case "txt":
                    return this.load_txt( abbr );
                case "json":
                    return this.load_json( abbr );
                case "png":
                case "jpg":
                    return this.load_image( abbr, category );
                case "texture":
                    return this.load_texture( abbr, options!.image! );
                case "sprite-frame":
                    return this.load_sprite_frame( abbr, options!.image! );
                case "sprite-atlas":
                    return this.load_sprite_atlas( abbr, options!.image! );
                case "audio":
                    return this.load_audio( abbr );
                case "buffer":
                    return this.load_buffer( abbr );
                case "spine-json":
                case "spine-bin":
                    return this.load_spine( abbr, options!.spine! );
                case "bmfont":
                    return this.load_bmfont( abbr );
            }

            return Promise.resolve( null );
        }

        private get_url( abbr: string, ext: string ) {
            let url = this._manifest[abbr + ext];
            if ( !url ) return null;
            return app.preferences!.server_addr_res + url + "?v=" + app.preferences!.app_version;
        }

        private on_loaded<T extends Asset>( key: string, res: ( v: T | null ) => void, err: Error | null, data: T ) {
            if ( err ) {
                res( null );
            } else {
                this._assets.set( key, data );
                data.addRef();
                res( data );
            }
        }

        private load_txt( abbr: string ) {
            const url = this.get_url( abbr, ".txt" );
            if ( !url ) return Promise.resolve( null );

            const key = abbr + "/txt";
            if ( this._assets.has( key ) ) {
                const txt = this._assets.get( key )! as TextAsset;
                txt.addRef();
                return Promise.resolve( txt );
            }

            const that = this;
            return new Promise<TextAsset | null>( res => {
                assetManager.loadRemote( url, { ext: ".txt" }, function ( err, data: TextAsset ) {
                    that.on_loaded( key, res, err, data );
                } );
            } );
        }

        private load_json( abbr: string ) {
            const url = this.get_url( abbr, "json" );
            if ( !url ) return Promise.resolve( null );

            const key = abbr + "/json";
            if ( this._assets.has( key ) ) {
                const json = this._assets.get( key )! as JsonAsset;
                json.addRef();
                return Promise.resolve( json );
            }

            const that = this;
            return new Promise<JsonAsset | null>( res => {
                assetManager.loadRemote( url, { ext: ".json" }, function ( err, data: JsonAsset ) {
                    that.on_loaded( key, res, err, data );
                } );
            } );
        }

        private load_image( abbr: string, ext: "png" | "jpg" ) {
            const url = this.get_url( abbr, ext );
            if ( !url ) return Promise.resolve( null );

            const key = abbr + "/" + ext;
            if ( this._assets.has( key ) ) {
                const img = this._assets.get( key )! as ImageAsset;
                img.addRef();
                return Promise.resolve( img );
            }

            const that = this;
            return new Promise<ImageAsset | null>( res => {
                assetManager.loadRemote( url, { ext }, function ( err, data: ImageAsset ) {
                    that.on_loaded( key, res, err, data );
                } );
            } );
        }

        private load_texture( abbr: string, ext: "png" | "jpg" ) {
            // 先去缓存中找 Texture2D
            const image_key = abbr + "/" + ext;
            const key = image_key + "/texture";
            if ( this._assets.has( key ) ) {
                const tex = this._assets.get( key )! as Texture2D;
                tex.addRef();
                return Promise.resolve( tex );
            }

            // 接着去缓存中找 ImageAsset
            if ( this._assets.has( image_key ) ) {
                const tex = new Texture2D();
                const img = this._assets.get( image_key )! as ImageAsset;
                tex.image = img;
                img.addRef();
                tex.addRef();
                this._assets.set( key, tex );
                return Promise.resolve( tex );
            }

            // 最后先去加载 ImageAsset，再创建 Texture2D
            return new Promise<Texture2D | null>( ( res ) => {
                this.load_image( abbr, ext ).then( ( img ) => {
                    if ( img ) {
                        const tex = new Texture2D();
                        tex.image = img;
                        tex.addRef();
                        this._assets.set( key, tex );
                        res( tex );
                    } else {
                        res( null );
                    }
                } );
            } );
        }

        private load_sprite_frame( abbr: string, ext: "png" | "jpg" ) {
            // 先去缓存中找 SpriteFrame
            const image_key = abbr + "/" + ext;
            const key = image_key + "/sprite-frame";
            if ( this._assets.has( key ) ) {
                const frame = this._assets.get( key )! as SpriteFrame;
                frame.addRef();
                return Promise.resolve( frame );
            }

            // 再去缓存中找 Texture2D
            const tex_key = image_key + "/texture";
            if ( this._assets.has( tex_key ) ) {
                const tex = this._assets.get( key )! as Texture2D;
                const frame = new SpriteFrame();
                frame.texture = tex;
                tex.addRef();
                frame.addRef();
                this._assets.set( key, frame );
                return Promise.resolve( frame );
            }

            // 再去缓存中找 ImageAsset
            if ( this._assets.has( image_key ) ) {
                const img = this._assets.get( image_key )! as ImageAsset;
                const tex = new Texture2D();
                const frame = new SpriteFrame();
                tex.image = img;
                frame.texture = tex;
                tex.addRef();
                img.addRef();
                frame.addRef();
                this._assets.set( tex_key, tex );
                this._assets.set( key, frame );
                return Promise.resolve( frame );
            }

            // 最后去加载 SpriteFrame
            return new Promise<SpriteFrame | null>( ( res ) => {
                this.load_image( abbr, ext ).then( ( img ) => {
                    if ( img ) {
                        const tex = new Texture2D();
                        const frame = new SpriteFrame();
                        tex.image = img;
                        frame.texture = tex;
                        tex.addRef();
                        frame.addRef();
                        this._assets.set( tex_key, tex );
                        this._assets.set( key, frame );
                        return res( frame );
                    } else {
                        res( null );
                    }
                } );
            } );
        }

        private load_sprite_atlas( abbr: string, ext: "png" | "jpg" ) {
            return new Promise<SpriteAtlas | null>( res => {
                const key = abbr + "/sprite-atlas";
                if ( this._assets.has( key ) ) {
                    const atlas = this._assets.get( key )! as SpriteAtlas;
                    atlas.addRef();
                    return res( atlas );
                }

                Promise.all( [ this.load_json( abbr ), this.load_sprite_frame( abbr, ext ) ] ).then( ( data ) => {
                    const [ json, frame ] = data;
                    if ( json && frame ) {
                        const atlas = new SpriteAtlas();
                        atlas.addRef();
                        this._assets.set(key, atlas);
                        return res( null );
                    } else {
                        return res( null );
                    }
                } );
            } );
        }

        private load_audio( abbr: string ) {
            return new Promise<AudioClip | null>( res => {
                return res( null );
            } );
        }

        private load_bmfont( abbr: string ) {
            return new Promise<BitmapFont | null>( res => {
                return res( null );
            } );
        }

        private load_buffer( abbr: string ) {
            return new Promise<BufferAsset | null>( res => {
                return res( null );
            } );
        }

        private load_spine( abbr: string, ext: "json" | "ske" ) {
            return new Promise<sp.SkeletonData | null>( res => {
                return res( null );
            } );
        }
    }

    /** 远程资源类型 */
    export type RemoteCategory =
        | "json"
        | "txt"
        | "jpg"
        | "png"
        | "sprite-frame"
        | "texture"
        | "bmfont"
        | "font"
        | "audio"
        | "buffer"
        | "sprite-atlas"
        | "spine-json"
        | "spine-bin";

    class Loader {
        public static readonly $cname = "loader";

        public readonly main: BundleLoader;
        public readonly internal: BundleLoader;
        public readonly resources: BundleLoader;
        public readonly remote: RemoteLoader;
        private _bundles: Record<string, BundleLoader> = {};

        constructor() {
            this.internal = this._bundles["internal"] = new BundleLoader( assetManager.getBundle( "internal" )! );
            this.main = this._bundles["main"] = new BundleLoader( assetManager.getBundle( "internal" )! );
            this.resources = this._bundles["resources"] = new BundleLoader( assetManager.getBundle( "main" )! );
            this.remote = new RemoteLoader();
        }

        public add_bundle( name: string, version?: string ) {
            return new Promise<BundleLoader | null>( ( resolve ) => {
                const bundles = this._bundles;
                if ( bundles[name] ) {
                    return resolve( bundles[name] );
                }

                const options: Record<string, any> = {};
                if ( be.is_url( name ) && version ) {
                    options.version = version;
                }
                assetManager.loadBundle( name, options, function ( err, data ) {
                    if ( err ) {
                        resolve( null );
                    } else {
                        bundles[name] = new BundleLoader( data );
                        resolve( bundles[name] );
                    }
                } );
            } );
        }

        public bundle( name: string ) {
            return this._bundles[name];
        }
    }

    export const loader = singletons.acquire<Loader>( Loader );
}