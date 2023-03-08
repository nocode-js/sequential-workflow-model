import dts from 'rollup-plugin-dts';
import typescript from 'rollup-plugin-typescript2';

export default [
	{
		input: './src/index.ts',
		plugins: [
			typescript({
				useTsconfigDeclarationDir: true
			})
		],
		cache: false,
		output: [
			{
				file: './lib/cjs/index.cjs',
				format: 'cjs'
			},
			{
				file: './lib/esm/index.js',
				format: 'es'
			}
		]
	},
	{
		input: './build/index.d.ts',
		output: [
			{
				file: './lib/index.d.ts',
				format: 'es'
			}
		],
		plugins: [dts()],
	}
];
