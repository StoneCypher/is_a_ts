
import commonjs    from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';





const es6_config = {

  input   : 'build/typescript/index.js',

  output  : {
    file   : 'build/rollup/index.js',
    format : 'es',
    name   : 'is_a_ts'
  },

  plugins : [

    commonjs(),

    nodeResolve({
      mainFields     : ['module', 'main'],
      extensions     : [ '.js' ],
      preferBuiltins : false
    })

  ]

};





export default [ es6_config ];
