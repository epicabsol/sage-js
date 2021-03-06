import fs from 'fs';
import path from 'path';
import util from 'util';

import gulp from 'gulp';
import gulpRename from 'gulp-rename';
import gulpInsert from 'gulp-insert';
import gulpFilter from 'gulp-filter';
import gulpReplace from 'gulp-replace';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpBabel from 'gulp-babel';
import pump from 'pump';

const pumpP = util.promisify(pump);
const fsReadFileP = util.promisify(fs.readFile);

async function packageJSON() {
	packageJSON.json = packageJSON.json || fsReadFileP('package.json', 'utf8');
	return JSON.parse(await packageJSON.json);
}

async function babelrc() {
	babelrc.json = babelrc.json || fsReadFileP('.babelrc', 'utf8');
	const r = JSON.parse(await babelrc.json);

	// Prevent .babelrc file from being loaded again by the plugin.
	r.babelrc = false;
	return r;
}

async function babelTarget(src, srcOpts, dest, modules) {
	// Change module.
	const babelOptions = await babelrc();
	for (const preset of babelOptions.presets) {
		if (preset[0] === '@babel/preset-env') {
			preset[1].modules = modules;
		}
	}

	// Read the package JSON.
	const pkg = await packageJSON();

	// Filter meta data file and create replace transform.
	const filterMeta = gulpFilter(['*/meta.ts'], {restore: true});
	const filterMetaReplaces = [
		["'@VERSION@'", JSON.stringify(pkg.version)],
		["'@NAME@'", JSON.stringify(pkg.name)]
	].map(v => gulpReplace(...v));

	// XXX:
	// Work around Babel bug by removing empty annotations.
	// The annotations causes self-referencing class properties to fail.
	// Remove this code once the bug is fixed.
	// Fortunately they can all be removed without issue in this ugly hack.
	const filterAntlr = gulpFilter([
		'*/antlr/*Lexer.ts',
		'*/antlr/*Parser.ts'
	], {restore: true});
	const filterAntlrReplaces = [
		['@Override', '/*@Override*/'],
		['@NotNull', '/*@NotNull*/'],
		['@RuleVersion(0)', '/*@RuleVersion(0)*/']
	].map(v => gulpReplace(...v));

	await pumpP(...[
		gulp.src(src, srcOpts),
		filterMeta,
		...filterMetaReplaces,
		filterMeta.restore,
		filterAntlr,
		...filterAntlrReplaces,
		filterAntlr.restore,
		gulpSourcemaps.init(),
		gulpBabel(babelOptions),
		gulpRename(path => {
			if (!modules && path.extname === '.js') {
				path.extname = '.mjs';
			}
		}),
		gulpSourcemaps.write('.', {
			includeContent: true,
			addComment: false,
			destPath: dest
		}),
		gulpInsert.transform((contents, file) => {
			if (/\.m?js$/i.test(file.path)) {
				const base = path.basename(file.path);
				return `${contents}\n//# sourceMappingURL=${base}.map\n`;
			}
			return contents;
		}),
		gulp.dest(dest)
	].filter(Boolean));
}

export async function buildLibCjs() {
	await babelTarget(['src/**/*.ts'], {}, 'lib', 'commonjs');
}

export async function buildLibMjs() {
	await babelTarget(['src/**/*.ts'], {}, 'lib', false);
}
