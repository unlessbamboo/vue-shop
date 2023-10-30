/*
 * 功能: 用于icon相关的添加
 */

/* import the fontawesome core */
import {library} from "@fortawesome/fontawesome-svg-core";
/* import font awesome icon component */
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
/* import specific icons */
import {
  faChevronDown,
  faCircleXmark,
  faBars,
  faHome,
  faUser,
  faEnvelope,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

/* add icons to the library */
library.add(faChevronDown);
library.add(faCircleXmark);
library.add(faBars);
library.add(faHome);
library.add(faUser);
library.add(faEnvelope);
library.add(faSearch);

export {FontAwesomeIcon};
