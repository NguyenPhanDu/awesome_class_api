const mongoose = require('mongoose');
const drive = require('../../../config/google_drive/index');
const Folder = require('../../models/Folder');
const FolerUser = require('../../models/FolderUser');
const FolderClass = require('../../models/FolderClass');
const FolderHomework = require('../../models/FolderHomework');
const ClassHomework = require('../../models/ClassHomework');
const File = require('../../models/File');
const NormalHomework = require('../../models/NormalHomework');
const fs = require('fs');